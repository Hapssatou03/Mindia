import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { createdAt: 'asc' } } },
  });

  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: game.id,
    theme: game.theme,
    level: game.level,
    scoreFinal: game.scoreFinal,
    questions: game.questions.map(q => ({
      id: q.id,
      text: q.text,
      choices: q.choices as string[],
    })),
  });
}
