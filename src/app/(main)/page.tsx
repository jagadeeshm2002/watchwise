"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CourseItem = {
  id: string;
  title: string;
  slug: string;
  creatorId: string;
  creatorName: string;
  averageRating: number | null;
  totalEnrollments: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  _count: { reviews: number };
  videos?: { thumbnailUrl: string | null; position: number }[];
};

export default function ForYouPage() {
  const { data, isPending } = useSession();
  const user = data?.user;

  const [items, setItems] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (user?.id) params.set("userId", user.id);
        params.set("limit", "12");
        const res = await fetch(`/api/recommendations?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load recommendations (${res.status})`);
        const json = (await res.json()) as { items: CourseItem[] };
        setItems(json.items || []);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [user?.id]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">For You</h1>
        <div className="text-sm text-muted-foreground">
          {user ? `Personalized for ${user.name ?? "you"}` : "Popular picks"}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="space-y-3">
          <div className="text-red-600">{error}</div>
          <Button variant="outline" onClick={() => location.reload()}>Retry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <CardHeader className="p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={c.title}
                  src={c.videos?.[0]?.thumbnailUrl || "/file.svg"}
                  className="w-full h-40 object-cover bg-muted"
                />
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="font-medium line-clamp-1" title={c.title}>{c.title}</div>
                <div className="text-xs text-muted-foreground">by {c.creatorName}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span>⭐ {c.averageRating?.toFixed(1) ?? "0.0"}</span>
                  <span>• {c._count.reviews} reviews</span>
                  <span>• {c.level}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
