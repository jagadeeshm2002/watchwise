import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/recommendations?userId=optional
// If userId provided, build simple content-based recommendations using user's
// reviewed/forked/created courses' tags and preferred levels. Fallback to popular.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const limit = Math.min(30, Math.max(6, parseInt(searchParams.get("limit") || "12", 10)));

    // Base visibility
    const baseWhere = { visibility: "PUBLIC" as const, status: "PUBLISHED" as const };

    if (!userId) {
      const items = await prisma.course.findMany({
        where: baseWhere,
        orderBy: [{ totalEnrollments: "desc" }, { averageRating: "desc" }, { createdAt: "desc" }],
        take: limit,
        include: {
          _count: { select: { reviews: true } },
          videos: { select: { thumbnailUrl: true, position: true }, orderBy: { position: "asc" }, take: 1 },
        },
      });
      return NextResponse.json({ items }, { status: 200 });
    }

    // Collect user's interactions
    const [reviews, forks, created] = await Promise.all([
      prisma.review.findMany({ where: { userId }, include: { course: true } }),
      prisma.userCourseFork.findMany({ where: { userId }, include: { course: true } }),
      prisma.course.findMany({ where: { creatorId: userId } }),
    ]);

    // Derive preferred tags and levels
    const tagScore = new Map<string, number>();
    const levelScore = new Map<string, number>();

    const bump = (m: Map<string, number>, k: string, v = 1) => m.set(k, (m.get(k) || 0) + v);

    for (const r of reviews) {
      const c: any = r.course as any;
      const tags = Array.isArray(c?.tags) ? (c.tags as any[]).map((x) => String(x).toLowerCase()) : [];
      tags.forEach((t) => bump(tagScore, t, r.rating));
      if (c?.level) bump(levelScore, String(c.level));
    }

    for (const f of forks) {
      const c: any = f.course as any;
      const tags = Array.isArray(c?.tags) ? (c.tags as any[]).map((x) => String(x).toLowerCase()) : [];
      tags.forEach((t) => bump(tagScore, t, 2));
      if (c?.level) bump(levelScore, String(c.level), 2);
    }

    for (const c of created) {
      const tags = Array.isArray((c as any)?.tags) ? ((c as any).tags as any[]).map((x) => String(x).toLowerCase()) : [];
      tags.forEach((t) => bump(tagScore, t, 1));
      if (c?.level) bump(levelScore, String(c.level), 1);
    }

    const preferredTags = Array.from(tagScore.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t);

    const preferredLevels = Array.from(levelScore.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([lvl]) => lvl);

    // Fetch candidates
    let candidates = await prisma.course.findMany({
      where: baseWhere,
      orderBy: [{ averageRating: "desc" }, { createdAt: "desc" }],
      take: limit * 4, // fetch more for client-side tag filtering
      include: {
        _count: { select: { reviews: true } },
        videos: { select: { thumbnailUrl: true, position: true }, orderBy: { position: "asc" }, take: 1 },
      },
    });

    // Filter: exclude user's own created courses from recommendations; prefer tags/levels
    candidates = candidates.filter((c) => c.creatorId !== userId);

    if (preferredTags.length) {
      candidates = candidates.filter((c: any) => {
        const courseTags = Array.isArray(c.tags) ? (c.tags as any[]).map((x) => String(x).toLowerCase()) : [];
        return preferredTags.some((t) => courseTags.includes(t));
      });
    }

    if (preferredLevels.length) {
      candidates = candidates.filter((c) => preferredLevels.includes(String(c.level)));
    }

    // Fallback if filters are too strict
    if (candidates.length < 6) {
      candidates = await prisma.course.findMany({
        where: baseWhere,
        orderBy: [{ totalEnrollments: "desc" }, { averageRating: "desc" }, { createdAt: "desc" }],
        take: limit,
        include: {
          _count: { select: { reviews: true } },
          videos: { select: { thumbnailUrl: true, position: true }, orderBy: { position: "asc" }, take: 1 },
        },
      });
    }

    const items = candidates.slice(0, limit);
    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error("Recommendations error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
