/**
 * lib/email.ts — transactional email via Resend.
 * Keep templates as plain functions returning { subject, html } rather than
 * pulling in react-email components here, so this file has zero React
 * dependency and can be called from any server context.
 */

import { Resend } from "resend";
import { SITE } from "@/lib/constants";
import { formatFullDate } from "@/lib/utils";

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set — cannot send email.");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM = process.env.EMAIL_FROM ?? `${SITE.name} <no-reply@example.com>`;

export async function sendBookingConfirmation(params: {
  guestName: string;
  guestEmail: string;
  date: Date;
  durationMinutes: number;
  meetingLink?: string | null;
}) {
  const { guestName, guestEmail, date, durationMinutes, meetingLink } = params;
  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: guestEmail,
    subject: `Confirmed: your ${durationMinutes}-minute call with ${SITE.name}`,
    html: `
      <div style="font-family: sans-serif; line-height:1.6;">
        <h2>You're booked in, ${guestName}!</h2>
        <p><strong>When:</strong> ${formatFullDate(date)} at ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}</p>
        <p><strong>Duration:</strong> ${durationMinutes} minutes</p>
        ${meetingLink ? `<p><strong>Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
        <p>Looking forward to it. If you need to reschedule, just reply to this email.</p>
        <p>— ${SITE.name}</p>
      </div>
    `,
  });

  // Notify the site owner too.
  await resend.emails.send({
    from: FROM,
    to: process.env.EMAIL_TO_ADMIN ?? SITE.email,
    subject: `New booking: ${guestName} — ${formatFullDate(date)}`,
    html: `<p>${guestName} (${guestEmail}) booked a ${durationMinutes}-minute call on ${formatFullDate(
      date
    )}.</p>`,
  });
}

export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const { name, email, subject, message } = params;
  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: process.env.EMAIL_TO_ADMIN ?? SITE.email,
    replyTo: email,
    subject: `Contact form: ${subject || "New message"} — from ${name}`,
    html: `
      <div style="font-family: sans-serif; line-height:1.6;">
        <p><strong>From:</strong> ${name} (${email})</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      </div>
    `,
  });
}

export async function sendTestimonialNotification(params: { authorName: string; quote: string; email?: string }) {
  const { authorName, quote, email } = params;
  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: process.env.EMAIL_TO_ADMIN ?? SITE.email,
    replyTo: email || undefined,
    subject: `New testimonial from ${authorName} — pending approval`,
    html: `
      <div style="font-family: sans-serif; line-height:1.6;">
        <p><strong>${authorName}</strong>${email ? ` (${email})` : ""} left a testimonial:</p>
        <p style="font-style: italic;">"${quote.replace(/\n/g, "<br/>")}"</p>
        <p>It won't appear on your site until you approve it from <strong>/admin/testimonials</strong>.</p>
      </div>
    `,
  });
}