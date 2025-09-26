import { NextResponse } from "next/server";
import { z } from "zod";
import type { GeneratedQuiz, QuizQuestion } from "../../types/quiz";

const BodySchema = z.object({
  theme: z.string().min(2),
  level: z.enum(["debutant", "intermediaire", "avance"]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { theme, level } = parse.data;

  const sampleChoices = [
    ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
    ["Option 1", "Option 2", "Option 3", "Option 4"],
    ["Vrai", "Faux", "Peut-être", "Je ne sais pas"],
  ];

  const questions: QuizQuestion[] = Array.from({ length: 10 }).map((_, i) => {
    const baseChoices = sampleChoices[i % sampleChoices.length];
    const correctIndex = i % 4;
    return {
      text: `(${level.toUpperCase()}) [${theme}] Question ${i + 1} ?`,
      choices: baseChoices,
      correctIndex,
    };
  });

  const payload: GeneratedQuiz = { questions };
  return NextResponse.json(payload, { status: 200 });
}
