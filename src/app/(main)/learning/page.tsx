"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Enrollment = {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "DROPPED" | "EXPIRED";
  progressPercent: number;
  completedVideos: number;
  totalVideos: number;
  lastAccessedAt: string | null;
  course: {
    id: string;
    title: string;
    creatorName: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    averageRating: number | null;
    _count: { reviews: number };
    videos?: { id: string; position: number; thumbnailUrl: string | null }[];
  };
};

export default function LearningDashboardPage() {
  const { data, isPending } = useSession();
  const user = data?.user;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ total: number; completed: number; active: number; paused: number; avgProgress: number } | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/learning/overview?userId=${user.id}&limit=12`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load overview (${res.status})`);
        const json = await res.json();
        setSummary(json.summary);
        setEnrollments(json.enrollments || []);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load overview");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [user?.id]);

  if (isPending) {
    return <div className="p-6">Loading session...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Learning Dashboard</h1>
        <p className="text-sm text-muted-foreground">Please sign in to see your enrolled courses and progress.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Learning Dashboard</h1>
        <div className="text-sm text-muted-foreground">for {user.name ?? "you"}</div>
      </div>

      {error ? (
        <div className="space-y-3">
          <div className="text-red-600">{error}</div>
          <Button variant="outline" onClick={() => location.reload()}>Retry</Button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Enrollments</div>
                <div className="text-2xl font-semibold">{summary?.total ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-2xl font-semibold">{summary?.active ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-semibold">{summary?.completed ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Avg Progress</div>
                <div className="text-2xl font-semibold">{Math.round(summary?.avgProgress ?? 0)}%</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Enrolled Courses List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-40 animate-pulse" />)
            ) : enrollments.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4">No enrollments yet. Explore courses and start learning!</div>
            ) : (
              enrollments.map((e) => (
                <Card key={e.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={e.course.title}
                      src={e.course.videos?.[0]?.thumbnailUrl || "/file.svg"}
                      className="w-full h-40 object-cover bg-muted"
                    />
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div className="font-medium line-clamp-1" title={e.course.title}>{e.course.title}</div>
                    <div className="text-xs text-muted-foreground">by {e.course.creatorName}</div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>⭐ {e.course.averageRating?.toFixed(1) ?? "0.0"}</span>
                      <span>• {e.course._count.reviews} reviews</span>
                      <span>• {e.course.level}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="h-2 w-full bg-muted rounded">
                        <div className="h-2 bg-primary rounded" style={{ width: `${Math.min(100, Math.max(0, e.progressPercent))}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {e.completedVideos}/{e.totalVideos} videos • {Math.round(e.progressPercent)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
