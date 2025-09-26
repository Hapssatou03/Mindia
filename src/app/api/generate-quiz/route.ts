import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import type { GeneratedQuiz, QuizQuestion } from "../../types/quiz";

export const runtime = "nodejs";

const BodySchema = z.object({
  theme: z.string().min(2),
  level: z.enum(["debutant", "intermediaire", "avance"]),
});

const QuizOutSchema = z.object({
  questions: z.array(
    z.object({
      text: z.string(),
      choices: z.array(z.string()).length(4),
      correctIndex: z.number().int().min(0).max(3),
    })
  ).length(10),
});

function simulate(theme: string, level: string): GeneratedQuiz {
  const sampleChoices = [
    ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
    ["Option 1", "Option 2", "Option 3", "Option 4"],
    ["Vrai", "Faux", "Peut-être", "Je ne sais pas"],
  ];
  const questions: QuizQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
    text: `(${level.toUpperCase()}) [${theme}] Question ${i + 1} ?`,
    choices: sampleChoices[i % sampleChoices.length],
    correctIndex: i % 4,
  }));
  return { questions };
}

export async function POST(req: Request) {
  const body = await req.json();
  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { theme, level } = parse.data;

  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ No OPENAI_API_KEY found, using simulation mode");
    return NextResponse.json(simulate(theme, level), { status: 200 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `
Tu es un générateur de quiz intelligent. Tu produis uniquement du JSON strict.
Schéma:
{
  "questions": [
    { "text": "string", "choices": ["A","B","C","D"], "correctIndex": 0 }
  ]
}
Règles: 10 questions, 4 choix exactement, 1 seule bonne réponse (index 0..3), pas d’explications.`;

    const user = `
Thème: "${theme}"
Niveau: "${level}" (debutant / intermediaire / avance)
Renvoie UNIQUEMENT le JSON conforme au schéma.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 1200,
      temperature: 0.5,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn("⚠️ JSON parse error from AI, using simulation");
      return NextResponse.json(simulate(theme, level), { status: 200 });
    }

    const valid = QuizOutSchema.safeParse(parsed);
    if (!valid.success) {
      console.warn("⚠️ Schema validation failed, using simulation");
      return NextResponse.json(simulate(theme, level), { status: 200 });
    }

    return NextResponse.json(valid.data satisfies GeneratedQuiz, { status: 200 });
  } catch (err) {
    console.error("❌ AI generation error:", err);
    return NextResponse.json(simulate(theme, level), { status: 200 });
  }
}
