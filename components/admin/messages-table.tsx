"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import type { ContactMessage } from "@prisma/client";
import { formatFullDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function MessagesTable({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function markRead(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Couldn't update that message");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Message deleted");
      router.refresh();
    } catch {
      toast.error("Couldn't delete that message");
    } finally {
      setBusyId(null);
    }
  }

  if (messages.length === 0) {
    return <p className="text-sm text-foreground-faint">No messages yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => (
        <Card key={msg.id} className={!msg.read ? "border-signal-amber/30" : undefined}>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{msg.name}</p>
                <span className="text-xs text-foreground-faint">{msg.email}</span>
                {!msg.read && <Badge variant="amber">New</Badge>}
              </div>
              {msg.subject && <p className="mt-1 text-sm text-foreground-muted">{msg.subject}</p>}
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground-muted">{msg.message}</p>
              <p className="mt-2 font-mono text-xs text-foreground-faint">{formatFullDate(msg.createdAt)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" disabled={busyId === msg.id} onClick={() => markRead(msg.id)} aria-label="Toggle read">
                {msg.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-signal-amber" />}
              </Button>
              <Button variant="ghost" size="icon" disabled={busyId === msg.id} onClick={() => remove(msg.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4 text-state-danger" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
