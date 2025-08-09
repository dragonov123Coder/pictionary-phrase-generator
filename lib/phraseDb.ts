import { promises as fs } from "fs";
import path from "path";
import { nouns, adjectives, verbs, extras } from "./words";

// Simple file-based store inside .data/phrases.json
const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "phrases.json");

function articleFor(word: string) {
  const first = word[0]?.toLowerCase();
  return ["a", "e", "i", "o", "u"].includes(first) ? "An" : "A";
}

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePhrase(): string {
  const noun = randomOf(nouns);
  const adj = randomOf(adjectives);
  const verb = randomOf(verbs);
  const extra = Math.random() < 0.6 ? ` ${randomOf(extras)}` : ""; // sometimes add flair
  return `${articleFor(adj)} ${adj} ${noun} ${verb}${extra}`;
}

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
  try {
    await fs.access(dataFile);
  } catch {
    // Seed with 300 generated phrases (unique-ish)
    const set = new Set<string>();
    while (set.size < 300) {
      set.add(generatePhrase());
    }
    await fs.writeFile(dataFile, JSON.stringify(Array.from(set), null, 2), "utf-8");
  }
}

export async function getNextPhrase(): Promise<string | null> {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf-8");
  const arr: string[] = JSON.parse(raw);
  if (!arr.length) return null;
  // remove a random element to avoid predictability and reuse
  const idx = Math.floor(Math.random() * arr.length);
  const [phrase] = arr.splice(idx, 1);
  await fs.writeFile(dataFile, JSON.stringify(arr, null, 2), "utf-8");
  return phrase;
}

export async function resetDatabase(count = 300) {
  await fs.mkdir(dataDir, { recursive: true });
  const set = new Set<string>();
  const limit = Math.max(50, count);
  while (set.size < limit) {
    set.add(generatePhrase());
  }
  await fs.writeFile(dataFile, JSON.stringify(Array.from(set), null, 2), "utf-8");
}
