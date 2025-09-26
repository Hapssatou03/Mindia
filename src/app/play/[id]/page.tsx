"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Q = { id: string; text: string; choices: string[] };

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/games/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
      setLoading(false);
    })();
  }, [id]);

  async function submit() {
    const payload = {
      answers: questions.map(q => ({
        questionId: q.id,
        chosenIndex: answers[q.id] ?? 0, // choix par défaut si vide
      })),
    };
    const res = await fetch(`/api/games/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
  }

  if (loading) return <div className="p-6">Chargement…</div>;

  if (result) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Résultat</h1>
        <p className="mb-6">Score : <b>{result.score}</b> / {result.total}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-2xl bg-black text-white px-5 py-3"
        >
          Rejouer
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Réponds aux questions</h1>
      {questions.map((q, idx) => (
        <div key={q.id} className="border rounded-2xl p-4">
          <div className="font-semibold mb-3">{idx + 1}. {q.text}</div>
          <div className="grid gap-2">
            {q.choices.map((choice, i) => {
              const selected = answers[q.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                  className={`text-left border rounded-xl px-4 py-2 ${selected ? "border-black" : ""}`}
                >
                  {String.fromCharCode(65 + i)}. {choice}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button onClick={submit} className="w-full rounded-2xl bg-black text-white px-5 py-3">
        Valider mes réponses
      </button>
    </main>
  );
}
