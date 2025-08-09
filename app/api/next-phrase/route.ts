import { NextResponse } from "next/server";
import { getNextPhrase } from "@/lib/phraseDb";

export const runtime = "nodejs";

export async function POST() {
  try {
    const phrase = await getNextPhrase();
    if (!phrase) {
      // Database depleted
      return new NextResponse(null, { status: 410 });
    }
    return NextResponse.json({ phrase });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
