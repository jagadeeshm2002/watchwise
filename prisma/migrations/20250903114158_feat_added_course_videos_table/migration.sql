-- CreateEnum
CREATE TYPE "public"."CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."CourseVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."VideoSourceType" AS ENUM ('YOUTUBE', 'VIMEO', 'CUSTOM_URL', 'UPLOAD');

-- CreateEnum
CREATE TYPE "public"."TranscriptStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "public"."EmbeddingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."TranscriptSource" AS ENUM ('AUTO_GENERATED', 'MANUAL', 'YOUTUBE_CC', 'UPLOADED');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'DROPPED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."SyncType" AS ENUM ('MANUAL', 'AUTOMATIC', 'MERGE');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "totalCoursesCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalForksCreated" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "playlistId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "creatorName" TEXT NOT NULL,
    "parentCourseId" TEXT,
    "isOriginal" BOOLEAN NOT NULL DEFAULT true,
    "forkCount" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "level" "public"."CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "tags" JSONB,
    "totalEnrollments" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "prerequisites" TEXT,
    "learningOutcomes" JSONB,
    "language" TEXT NOT NULL DEFAULT 'English',
    "visibility" "public"."CourseVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."videos" (
    "id" TEXT NOT NULL,
    "videoId" TEXT,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL,
    "sourceType" "public"."VideoSourceType" NOT NULL DEFAULT 'YOUTUBE',
    "videoOwnerChannelTitle" TEXT,
    "videoOwnerChannelId" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "duration" TEXT,
    "videoUrl" TEXT NOT NULL,
    "embedUrl" TEXT,
    "customVideoUrl" TEXT,
    "notes" TEXT,
    "isModified" BOOLEAN NOT NULL DEFAULT false,
    "originalVideoId" TEXT,
    "hasTranscript" BOOLEAN NOT NULL DEFAULT false,
    "transcriptStatus" "public"."TranscriptStatus" NOT NULL DEFAULT 'PENDING',
    "hasEmbeddings" BOOLEAN NOT NULL DEFAULT false,
    "embeddingStatus" "public"."EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_course_forks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "originalCourseId" TEXT NOT NULL,
    "customTitle" TEXT,
    "customDescription" TEXT,
    "customTags" JSONB,
    "forkReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_course_forks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVerifiedUser" BOOLEAN NOT NULL DEFAULT false,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_courseCode_key" ON "public"."courses"("courseCode");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "public"."courses"("slug");

-- CreateIndex
CREATE INDEX "courses_creatorId_idx" ON "public"."courses"("creatorId");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "public"."courses"("status");

-- CreateIndex
CREATE INDEX "courses_courseCode_idx" ON "public"."courses"("courseCode");

-- CreateIndex
CREATE INDEX "courses_parentCourseId_idx" ON "public"."courses"("parentCourseId");

-- CreateIndex
CREATE INDEX "courses_visibility_idx" ON "public"."courses"("visibility");

-- CreateIndex
CREATE INDEX "videos_courseId_idx" ON "public"."videos"("courseId");

-- CreateIndex
CREATE INDEX "videos_videoId_idx" ON "public"."videos"("videoId");

-- CreateIndex
CREATE INDEX "videos_position_idx" ON "public"."videos"("position");

-- CreateIndex
CREATE INDEX "videos_sourceType_idx" ON "public"."videos"("sourceType");

-- CreateIndex
CREATE INDEX "videos_originalVideoId_idx" ON "public"."videos"("originalVideoId");

-- CreateIndex
CREATE UNIQUE INDEX "user_course_forks_userId_courseId_key" ON "public"."user_course_forks"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_courseId_key" ON "public"."reviews"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_parentCourseId_fkey" FOREIGN KEY ("parentCourseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."videos" ADD CONSTRAINT "videos_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."videos" ADD CONSTRAINT "videos_originalVideoId_fkey" FOREIGN KEY ("originalVideoId") REFERENCES "public"."videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_course_forks" ADD CONSTRAINT "user_course_forks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_course_forks" ADD CONSTRAINT "user_course_forks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_course_forks" ADD CONSTRAINT "user_course_forks_originalCourseId_fkey" FOREIGN KEY ("originalCourseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
