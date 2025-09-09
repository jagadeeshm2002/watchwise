-- CreateTable
CREATE TABLE "public"."VideoProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "watchedDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDuration" DOUBLE PRECISION,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "watchCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "VideoProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoProgress_userId_idx" ON "public"."VideoProgress"("userId");

-- CreateIndex
CREATE INDEX "VideoProgress_videoId_idx" ON "public"."VideoProgress"("videoId");

-- CreateIndex
CREATE INDEX "VideoProgress_enrollmentId_idx" ON "public"."VideoProgress"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoProgress_enrollmentId_videoId_key" ON "public"."VideoProgress"("enrollmentId", "videoId");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "public"."Enrollment"("userId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "public"."Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "public"."Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "public"."Enrollment"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "public"."VideoProgress" ADD CONSTRAINT "VideoProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoProgress" ADD CONSTRAINT "VideoProgress_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoProgress" ADD CONSTRAINT "VideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoProgress" ADD CONSTRAINT "VideoProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
