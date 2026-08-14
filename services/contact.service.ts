/**
 * services/contact.service.ts
 */
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";
import type { ContactFormInput } from "@/lib/validations";

export async function submitContactMessage(input: ContactFormInput) {
  const message = await prisma.contactMessage.create({
    data: { name: input.name, email: input.email, subject: input.subject, message: input.message },
  });

  await sendContactNotification(input);
  await prisma.analyticsEvent.create({ data: { type: "CONTACT_SUBMITTED" } });

  return message;
}

export async function listContactMessagesForAdmin() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function markContactMessageRead(id: string) {
  return prisma.contactMessage.update({ where: { id }, data: { read: true } });
}
