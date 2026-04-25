import { NextResponse } from "next/server";
import { parseUserIntent } from "@/lib/intent-agent";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const result = await parseUserIntent(message, history || []);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Configure API Error:", error);
    return NextResponse.json(
      { error: "Failed to configure endpoint", details: error.message },
      { status: 500 }
    );
  }
}
