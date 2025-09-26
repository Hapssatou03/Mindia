import { NextResponse } from "next/server";
export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20;
  return NextResponse.json({ openaiKeyLoaded: hasKey });
}
