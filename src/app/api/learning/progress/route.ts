import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/learning/progress
// Body: { userId: string, courseId: string, videoId: string, watchedSeconds?: number, completed?: boolean }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, courseId, videoId } = body || {};
    let { watchedSeconds, completed } = body || {} as { watchedSeconds?: number; completed?: boolean };

    if (!userId || !courseId || !videoId) {
      return NextResponse.json({ error: "userId, courseId and videoId are required" }, { status: 400 });
    }

    // Sanitize inputs
    watchedSeconds = typeof watchedSeconds === "number" && watchedSeconds >= 0 ? Math.floor(watchedSeconds) : undefined;
    completed = typeof completed === "boolean" ? completed : undefined;

    // Ensure course/video exist and find total videos
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { videos: true } } },
    });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const video = await prisma.video.findFirst({ where: { id: videoId, courseId } });
    if (!video) return NextResponse.json({ error: "Video not found in course" }, { status: 404 });

    // Upsert progress per video
    const progress = await prisma.videoProgress.upsert({
      where: { userId_videoId: { userId, videoId } },
      create: {
        userId,
        courseId,
        videoId,
        watchedSeconds: watchedSeconds ?? 0,
        completed: completed ?? false,
        lastWatchedAt: new Date(),
      },
      update: {
        watchedSeconds: watchedSeconds ?? undefined,
        completed: completed ?? undefined,
        lastWatchedAt: new Date(),
      },
    });

    // Ensure enrollment exists
    let enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          status: "ACTIVE",
          totalVideos: course._count.videos,
          lastAccessedAt: new Date(),
        },
      });
    }

    // Recompute completedVideos and progressPercent
    const [completedCount, totalVideosCount] = await Promise.all([
      prisma.videoProgress.count({ where: { userId, courseId, completed: true } }),
      prisma.video.count({ where: { courseId } }),
    ]);

    const progressPercent = totalVideosCount > 0 ? (completedCount / totalVideosCount) * 100 : 0;

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedVideos: completedCount,
        totalVideos: totalVideosCount,
        progressPercent,
        lastAccessedAt: new Date(),
        status: progressPercent >= 100 ? "COMPLETED" : "ACTIVE",
      },
    });

    return NextResponse.json({ progress, enrollment: updatedEnrollment }, { status: 200 });
  } catch (e) {
    console.error("Update progress error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
