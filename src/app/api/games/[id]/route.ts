import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: { questions: { orderBy: { createdAt: "asc" } } },
  });

  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: game.id,
    theme: game.theme,
    level: game.level,
    scoreFinal: game.scoreFinal,
    questions: game.questions.map((q) => ({
      id: q.id,
      text: q.text,
      choices: q.choices as string[],
    })),
  });
}
