"use client";

import { useState } from "react";
import { nouns, adjectives, verbs, extras } from "@/lib/words";

export default function Home() {
  const [phrase, setPhrase] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [depleted, setDepleted] = useState(false);

  const getPhrase = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/next-phrase", { method: "POST" });
      if (res.status === 410 || res.status === 204) {
        setDepleted(true);
        setPhrase("");
        return;
      }
      if (!res.ok) {
        // Fallback to client generator when API isn't available (e.g., GitHub Pages)
        await fallbackGenerate();
        return;
      }
      const data = (await res.json()) as { phrase: string };
      setPhrase(data.phrase);
      setDepleted(false);
  } catch {
      // Network or other error: fallback for static hosting
      await fallbackGenerate();
    } finally {
      setLoading(false);
    }
  };

  // ---------- Client-only fallback for static hosting (GitHub Pages) ----------
  const LS_KEY = "ppg_usedPhrases_v1";

  function articleFor(word: string) {
    const first = word[0]?.toLowerCase();
    return ["a", "e", "i", "o", "u"].includes(first) ? "An" : "A";
  }
  function randomOf<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function clientGeneratePhrase(): string {
    const noun = randomOf(nouns);
    const adj = randomOf(adjectives);
    const verb = randomOf(verbs);
    const extra = Math.random() < 0.6 ? ` ${randomOf(extras)}` : "";
    return `${articleFor(adj)} ${adj} ${noun} ${verb}${extra}`;
  }
  function getUsedSet(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(LS_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  }
  function saveUsedSet(set: Set<string>) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set)));
    } catch {
      // ignore write errors (e.g., private mode)
    }
  }
  async function fallbackGenerate() {
    // Try to generate a new phrase not seen in this browser
    const used = getUsedSet();
    let candidate = "";
    let attempts = 0;
    const maxAttempts = 200;
    while (attempts < maxAttempts) {
      candidate = clientGeneratePhrase();
      if (!used.has(candidate)) break;
      attempts++;
    }
    if (attempts >= maxAttempts) {
      setDepleted(true);
      setPhrase("");
      setError("");
      return;
    }
    used.add(candidate);
    saveUsedSet(used);
    setPhrase(candidate);
    setDepleted(false);
    setError("");
  }
  const resetLocal = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(LS_KEY);
      setDepleted(false);
      setError("");
    } catch {}
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-600 flex items-center justify-center p-6">
      <main className="w-full max-w-xl">
        <div className="mx-auto rounded-3xl shadow-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl p-8 text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Pictionary Phrase Generator
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-8">
            Click the button to draw a fresh, quirky phrase. Each phrase is unique
            and won’t repeat until the database is reset.
          </p>

          <div className="min-h-[96px] sm:min-h-[112px] flex items-center justify-center">
            {depleted ? (
              <p className="text-amber-200 font-medium">
                You’ve used all phrases. Reset the database to start over.
              </p>
            ) : error ? (
              <p className="text-red-200 font-medium">{error}</p>
            ) : phrase ? (
              <p className="text-2xl sm:text-3xl font-bold leading-snug drop-shadow">
                {phrase}
              </p>
            ) : (
              <p className="text-white/70">Your next phrase will appear here…</p>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={getPhrase}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold bg-white text-indigo-700 hover:bg-violet-50 active:bg-violet-100 disabled:opacity-60 transition-colors shadow-lg"
            >
              {loading ? "Generating…" : "Generate phrase"}
            </button>
            <button
              onClick={resetLocal}
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/30 text-white"
              title="Reset local phrases (for static hosting fallback)"
            >
              Reset local
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
