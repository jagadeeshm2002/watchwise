"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CourseItem = {
  id: string;
  title: string;
  slug: string;
  creatorId: string;
  creatorName: string;
  averageRating: number | null;
  totalEnrollments: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  tags: unknown;
  _count: { reviews: number };
  videos?: { thumbnailUrl: string | null; position: number }[];
};

type ApiResponse = {
  items: CourseItem[];
  page: number;
  pageSize: number;
  total: number;
};

function useQuerySync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = (next: Record<string, string | number | undefined | null>) => {
    const sp = new URLSearchParams(searchParams?.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") sp.delete(k);
      else sp.set(k, String(v));
    });
    router.replace(`${pathname}?${sp.toString()}`);
  };

  return { searchParams, setParams };
}

export default function ExplorePage() {
  const { searchParams, setParams } = useQuerySync();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams?.get("q") || "";
  const tags = searchParams?.get("tags") || ""; // comma-separated
  const author = searchParams?.get("author") || "";
  const level = searchParams?.get("level") || "";
  const minRating = searchParams?.get("minRating") || "";
  const minReviews = searchParams?.get("minReviews") || "";
  const sort = searchParams?.get("sort") || "newest";
  const page = parseInt(searchParams?.get("page") || "1", 10);

  // Fetch when params change
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams();
        if (q) sp.set("q", q);
        if (tags) sp.set("tags", tags);
        if (author) sp.set("author", author);
        if (level) sp.set("level", level);
        if (minRating) sp.set("minRating", minRating);
        if (minReviews) sp.set("minReviews", minReviews);
        if (sort) sp.set("sort", sort);
        sp.set("page", String(page || 1));
        sp.set("pageSize", String(12));
        const res = await fetch(`/api/courses?${sp.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load courses (${res.status})`);
        const json = (await res.json()) as ApiResponse;
        setData(json);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [q, tags, author, level, minRating, minReviews, sort, page]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement & {
      q: { value: string };
      tags: { value: string };
      author: { value: string };
      level: { value: string };
      minRating: { value: string };
      minReviews: { value: string };
      sort: { value: string };
    };
    setParams({
      q: form.q.value,
      tags: form.tags.value,
      author: form.author.value,
      level: form.level.value === "ANY" ? "" : form.level.value,
      minRating: form.minRating.value,
      minReviews: form.minReviews.value,
      sort: form.sort.value,
      page: 1, // reset page when searching
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Explore Courses</h1>

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3">
          <label className="text-sm text-muted-foreground">Search</label>
          <Input name="q" defaultValue={q} placeholder="Search title" />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm text-muted-foreground">Tags (comma)</label>
          <Input name="tags" defaultValue={tags} placeholder="react, typescript" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-muted-foreground">Author</label>
          <Input name="author" defaultValue={author} placeholder="Creator name" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-muted-foreground">Level</label>
          <Select name="level" defaultValue={level || undefined} onValueChange={(v) => setParams({ level: v === "ANY" ? undefined : v, page: 1 })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ANY">Any</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
              <SelectItem value="EXPERT">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1">
          <label className="text-sm text-muted-foreground">Min rating</label>
          <Input name="minRating" type="number" min={0} max={5} step={0.5} defaultValue={minRating} />
        </div>
        <div className="md:col-span-1">
          <label className="text-sm text-muted-foreground">Min reviews</label>
          <Input name="minReviews" type="number" min={0} step={1} defaultValue={minReviews} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-muted-foreground">Sort</label>
          <Select name="sort" defaultValue={sort} onValueChange={(v) => setParams({ sort: v, page: 1 })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
              <SelectItem value="reviews">Most reviewed</SelectItem>
              <SelectItem value="popular">Most enrolled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1">
          <Button type="submit" className="w-full">Apply</Button>
        </div>
      </form>

      <Separator />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {data?.items.length || 0} of {data?.total || 0}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParams({ page: page - 1 })}>
                Prev
              </Button>
              <span className="text-sm">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setParams({ page: page + 1 })}>
                Next
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {data?.items.map((c) => (
              <Card key={c.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  {/* Thumbnail */}
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
        </>
      )}
    </div>
  );
}
