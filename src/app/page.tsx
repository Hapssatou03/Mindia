"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [theme, setTheme] = useState("");
  const [level, setLevel] = useState("debutant");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);

      const genRes = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, level }),
      });
      const gen = await genRes.json();

      const gameRes = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, level, pseudo: pseudo || undefined, questions: gen.questions }),
      });
      const game = await gameRes.json();

      router.push(`/play/${game.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Quiz Generate 🎯</h1>

      <form onSubmit={handleStart} className="space-y-4">
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Thème (ex: Histoire, Tech, Sport)"
          value={theme}
          onChange={e => setTheme(e.target.value)}
          required
        />
        <select
          className="w-full border rounded-xl p-3"
          value={level}
          onChange={e => setLevel(e.target.value)}
        >
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="avance">Avancé</option>
        </select>
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Pseudo (optionnel)"
          value={pseudo}
          onChange={e => setPseudo(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full rounded-2xl p-3 font-semibold bg-black text-white disabled:opacity-60"
        >
          {loading ? "Génération..." : "Lancer le quiz"}
        </button>
      </form>
    </main>
  );
}
