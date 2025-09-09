import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/learning/overview?userId=<id>&limit=12
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const limit = Math.min(50, Math.max(6, parseInt(searchParams.get("limit") || "12", 10)));

    // Fetch enrollments with courses
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
      include: {
        course: {
          include: {
            _count: { select: { reviews: true } },
            videos: { select: { id: true, position: true, thumbnailUrl: true }, orderBy: { position: "asc" }, take: 1 },
          },
        },
      },
    });

    // Summary stats
    const total = await prisma.enrollment.count({ where: { userId } });
    const completed = await prisma.enrollment.count({ where: { userId, status: "COMPLETED" } });
    const active = await prisma.enrollment.count({ where: { userId, status: "ACTIVE" } });
    const paused = await prisma.enrollment.count({ where: { userId, status: "PAUSED" } });

    // Average progress across all enrollments
    const progressAgg = await prisma.enrollment.aggregate({
      where: { userId },
      _avg: { progressPercent: true },
    });

    return NextResponse.json(
      {
        summary: {
          total,
          completed,
          active,
          paused,
          avgProgress: progressAgg._avg.progressPercent || 0,
        },
        enrollments,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Learning overview error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
