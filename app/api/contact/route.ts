import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { submitContactMessage } from "@/services/contact.service";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`contact:${getClientKey(req)}`, 5, 60_000);
  if (!ok) {
    return NextResponse.json({ error: "Too many messages sent. Please wait a moment and try again." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Honeypot field caught something — silently pretend success so bots don't learn to skip it.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  try {
    await submitContactMessage(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form submission failed:", err);
    return NextResponse.json({ error: "Something went wrong sending your message. Please try again." }, { status: 500 });
  }
}
