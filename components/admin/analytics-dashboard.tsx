"use client";

import { useEffect, useState } from "react";
import { Eye, Briefcase, MessageSquare, CalendarCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsSummary } from "@/types";

const STAT_CARDS = [
  { key: "totalPageViews", label: "Page views", icon: Eye },
  { key: "totalProjectViews", label: "Project views", icon: Briefcase },
  { key: "totalChatSessions", label: "Chat sessions", icon: MessageSquare },
  { key: "totalBookings", label: "Bookings", icon: CalendarCheck },
] as const;

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-foreground-muted">Analytics data isn't available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-md bg-signal-amber/10 p-2.5">
                <Icon className="h-5 w-5 text-signal-amber" />
              </div>
              <div>
                <p className="text-2xl font-medium text-foreground">{data[key]}</p>
                <p className="text-xs text-foreground-muted">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page views (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.viewsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#5C5F6B" fontSize={11} tickLine={false} />
              <YAxis stroke="#5C5F6B" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1B1E27", border: "1px solid rgba(255,255,255,0.09)" }} />
              <Line type="monotone" dataKey="views" stroke="#F5A623" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most-viewed projects</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProjects} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#5C5F6B" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="title" stroke="#5C5F6B" fontSize={11} width={140} />
              <Tooltip contentStyle={{ background: "#1B1E27", border: "1px solid rgba(255,255,255,0.09)" }} />
              <Bar dataKey="views" fill="#7C6CF0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
