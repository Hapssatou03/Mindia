import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { z } from "zod";

const SubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      chosenIndex: z.number().int().min(0).max(3),
    })
  ).length(10),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;

  const body = await req.json();
  const parse = SubmitSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { answers } = parse.data;

  const questions = await prisma.question.findMany({
    where: { gameId: id },
    select: { id: true, correctIndex: true },
  });

  const byId = new Map(questions.map((q) => [q.id, q.correctIndex]));
  let score = 0;

  const creations = answers.map((a) => {
    const correctIndex = byId.get(a.questionId);
    const isCorrect = correctIndex === a.chosenIndex;
    if (isCorrect) score++;
    return {
      questionId: a.questionId,
      chosenIndex: a.chosenIndex,
      isCorrect,
    };
  });

  await prisma.$transaction([
    prisma.answer.createMany({ data: creations }),
    prisma.game.update({ where: { id }, data: { scoreFinal: score } }),
  ]);

  return NextResponse.json({ score, total: answers.length }, { status: 200 });
}
