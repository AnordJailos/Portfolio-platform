"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RefreshCw, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type KnowledgeSummary = {
  counts: Record<string, number>;
  totalChunks: number;
  manualEntries: { id: string; title: string; source: string; contentPreview: string }[];
};

export function KnowledgeBaseManager() {
  const [summary, setSummary] = useState<KnowledgeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ title: string; content: string }>();

  async function loadSummary() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/embeddings");
      const data = await res.json();
      setSummary(data);
    } catch {
      toast.error("Couldn't load the knowledge base.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  async function handleSync() {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`Re-indexed ${data.sourcesIndexed} sources (${data.totalChunks} chunks).`);
      loadSummary();
    } catch {
      toast.error("Sync failed — check OPENAI_API_KEY is set.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function onAddEntry(data: { title: string; content: string }) {
    try {
      const res = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "CUSTOM" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Added to the knowledge base");
      reset();
      loadSummary();
    } catch {
      toast.error("Failed to add entry");
    }
  }

  async function deleteEntry(id: string) {
    try {
      const res = await fetch(`/api/embeddings?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Removed");
      loadSummary();
    } catch {
      toast.error("Failed to remove entry");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Index status</CardTitle>
            <CardDescription>What the AI assistant currently knows about, and how it's grounded.</CardDescription>
          </div>
          <Button onClick={handleSync} disabled={isSyncing} size="sm">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync knowledge base
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-foreground-faint">Loading…</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {summary &&
                Object.entries(summary.counts).map(([source, count]) => (
                  <Badge key={source} variant="outline">
                    {source}: {count}
                  </Badge>
                ))}
              <Badge variant="amber">{summary?.totalChunks ?? 0} total chunks</Badge>
            </div>
          )}
          <p className="mt-4 text-xs text-foreground-faint">
            Projects, blog posts, your bio, and FAQs (from lib/constants.ts) are indexed automatically whenever
            you save them. Click "Sync knowledge base" after editing lib/constants.ts directly, or if the
            assistant seems out of date.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a custom knowledge entry</CardTitle>
          <CardDescription>
            For anything that doesn't live in a project or post — quick facts, policies, or Q&As you want the
            assistant to know.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onAddEntry)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="kb-title">Title</Label>
              <Input id="kb-title" placeholder="e.g. Preferred contract terms" {...register("title", { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="kb-content">Content</Label>
              <Textarea id="kb-content" rows={4} {...register("content", { required: true })} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="self-start">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add entry
            </Button>
          </form>
        </CardContent>
      </Card>

      {summary && summary.manualEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom entries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {summary.manualEntries.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  <p className="mt-1 text-xs text-foreground-muted line-clamp-2">{entry.contentPreview}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} aria-label="Delete entry">
                  <Trash2 className="h-4 w-4 text-state-danger" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
