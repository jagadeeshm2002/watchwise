import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Utility to slugify titles
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// GET /api/courses
// Query params:
// - q: string (search in title)
// - tags: comma-separated list of tags (best-effort match within JSON tags)
// - author: string (search in creatorName)
// - authorId: string (exact match)
// - level: CourseLevel
// - minRating: number
// - minReviews: number
// - page: number (1-based)
// - pageSize: number
// - sort: "newest" | "rating" | "reviews" | "popular"
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const author = searchParams.get("author") || undefined;
    const authorId = searchParams.get("authorId") || undefined;
    const level = searchParams.get("level") || undefined;
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const minReviews = parseInt(searchParams.get("minReviews") || "0", 10);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10)));
    const sort = (searchParams.get("sort") || "newest") as
      | "newest"
      | "rating"
      | "reviews"
      | "popular";
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam
      ? tagsParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Base filters: only explore public, published courses
    const where: any = {
      visibility: "PUBLIC",
      status: "PUBLISHED",
    };

    if (q) where.title = { contains: q, mode: "insensitive" };
    if (author) where.creatorName = { contains: author, mode: "insensitive" };
    if (authorId) where.creatorId = authorId;
    if (level) where.level = level;

    // Tag filtering will be handled in post-processing to avoid JSON operator incompatibilities across DBs

    // Sorting
    const orderBy = (() => {
      switch (sort) {
        case "rating":
          return [{ averageRating: "desc" as const }, { createdAt: "desc" as const }];
        case "reviews":
          // Prisma cannot order directly by include _count; we’ll sort by createdAt as secondary
          // We'll fetch and sort by reviews count in JS if needed.
          return [{ createdAt: "desc" as const }];
        case "popular":
          return [{ totalEnrollments: "desc" as const }, { createdAt: "desc" as const }];
        case "newest":
        default:
          return [{ createdAt: "desc" as const }];
      }
    })();

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          _count: { select: { reviews: true } },
          videos: {
            select: { thumbnailUrl: true, position: true },
            orderBy: { position: "asc" },
            take: 1,
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    // Post-filtering
    let filtered = items.filter((c) => (c.averageRating || 0) >= minRating && c._count.reviews >= minReviews);
    if (tags.length) {
      filtered = filtered.filter((c) => {
        const courseTags: unknown = c.tags;
        return Array.isArray(courseTags)
          ? tags.every((t) => courseTags.map((x) => String(x).toLowerCase()).includes(t.toLowerCase()))
          : false;
      });
    }

    if (sort === "reviews") {
      filtered = filtered.sort((a, b) => b._count.reviews - a._count.reviews);
    }

    return NextResponse.json(
      {
        items: filtered,
        page,
        pageSize,
        total,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("List courses error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Generate a simple unique code (could be improved)
async function generateCourseCode(base: string) {
  const codeBase = base.replace(/[^A-Z0-9]/g, "").toUpperCase().slice(0, 8);
  let attempt = 0;
  while (attempt < 5) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const candidate = `${codeBase}-${suffix}`;
    const existing = await prisma.course.findUnique({ where: { courseCode: candidate } });
    if (!existing) return candidate;
    attempt++;
  }
  return `${codeBase}-${Date.now()}`;
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      // youtu.be or shorts/full links
      const pathParts = u.pathname.split("/").filter(Boolean);
      const vIdx = pathParts.findIndex((p) => p === "watch" || p === "shorts" || p === "embed");
      if (vIdx >= 0 && pathParts[vIdx + 1]) return pathParts[vIdx + 1];
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description = "",
      tags = [],
      level = "BEGINNER",
      visibility = "PUBLIC",
      creatorId,
      creatorName,
      youtubeUrls = [],
    } = body ?? {};

    if (!title || !creatorId || !creatorName) {
      return NextResponse.json(
        { error: "Missing required fields: title, creatorId, creatorName" },
        { status: 400 }
      );
    }

    const slugBase = slugify(title);
    let slug = slugBase;
    let i = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i++}`;
    }

    const courseCode = await generateCourseCode(title.toUpperCase());

    const videosData = (youtubeUrls as string[])
      .filter(Boolean)
      .map((url, idx) => {
        const id = extractYouTubeId(url);
        const thumbnailUrl = id
          ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
          : "/file.svg"; // fallback
        const embedUrl = id ? `https://www.youtube.com/embed/${id}` : undefined;
        return {
          videoId: id ?? undefined,
          title: `Video ${idx + 1}`,
          description: "",
          publishedAt: new Date(),
          position: idx + 1,
          sourceType: "YOUTUBE" as const,
          videoOwnerChannelTitle: null,
          videoOwnerChannelId: null,
          thumbnailUrl,
          duration: null,
          videoUrl: url,
          embedUrl,
          customVideoUrl: null,
          notes: null,
          isModified: false,
          originalVideoId: null,
          hasTranscript: false,
          transcriptStatus: "PENDING" as const,
          hasEmbeddings: false,
          embeddingStatus: "PENDING" as const,
        };
      });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        slug,
        courseCode,
        creatorId,
        creatorName,
        status: "DRAFT",
        level,
        tags,
        visibility,
        videos: videosData.length
          ? { create: videosData }
          : undefined,
      },
      include: { videos: true },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (e) {
    console.error("Create course error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
