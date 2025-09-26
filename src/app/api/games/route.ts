import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { z } from "zod";

const CreateGameSchema = z.object({
  theme: z.string().min(2),
  level: z.enum(["debutant", "intermediaire", "avance"]),
  pseudo: z.string().optional(),
  questions: z.array(
    z.object({
      text: z.string(),
      choices: z.array(z.string()).length(4),
      correctIndex: z.number().int().min(0).max(3),
    })
  ).length(10),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parse = CreateGameSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { theme, level, pseudo, questions } = parse.data;

  const game = await prisma.game.create({
    data: {
      theme,
      level,
      pseudo,
      questions: {
        create: questions.map(q => ({
          text: q.text,
          choices: q.choices as unknown as object,
          correctIndex: q.correctIndex,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: game.id }, { status: 201 });
}
