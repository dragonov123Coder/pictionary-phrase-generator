"use client";

import { useState } from "react";

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
        const data = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as { phrase: string };
      setPhrase(data.phrase);
      setDepleted(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
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

          <button
            onClick={getPhrase}
            disabled={loading}
            className="mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold bg-white text-indigo-700 hover:bg-violet-50 active:bg-violet-100 disabled:opacity-60 transition-colors shadow-lg"
          >
            {loading ? "Generating…" : "Generate phrase"}
          </button>
        </div>
      </main>
    </div>
  );
}
