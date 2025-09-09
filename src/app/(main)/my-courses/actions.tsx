// app/my-courses/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma as db } from '@/lib/db';

// Get courses with filtering
export async function getCourses(filters: {
  searchQuery: string;
  statusFilter: string;
  levelFilter: string;
  visibilityFilter: string;
}) {
  try {
    const { searchQuery, statusFilter, levelFilter, visibilityFilter } = filters;
    
    // Build where clause for filtering
    const where: any = {};
    
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { courseCode: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }
    
    if (statusFilter !== 'all') {
      where.status = statusFilter;
    }
    
    if (levelFilter !== 'all') {
      where.level = levelFilter;
    }
    
    if (visibilityFilter !== 'all') {
      where.visibility = visibilityFilter;
    }
    
    // Fetch courses from database
    const courses = await db.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return courses;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    throw new Error('Failed to fetch courses');
  }
}

// Delete course action
export async function deleteCourse(courseId: string) {
  try {
    await db.course.delete({
      where: { id: courseId },
    });
    
    revalidatePath('/my-courses');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete course:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}

// Duplicate course action
export async function duplicateCourse(courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return { success: false, error: 'Course not found' };
    }
    
    // Create a duplicate with "Copy of" prefix
    const duplicatedCourse = await db.course.create({
      data: {
        title: `Copy of ${course.title}`,
        description: course.description,
        courseCode: `${course.courseCode}-copy`,
        status: 'DRAFT',
        level: course.level,
        visibility: course.visibility,
        totalEnrollments: 0,
        thumbnailUrl: course.thumbnailUrl,
      },
    });
    
    revalidatePath('/my-courses');
    return { success: true, course: duplicatedCourse };
  } catch (error) {
    console.error('Failed to duplicate course:', error);
    return { success: false, error: 'Failed to duplicate course' };
  }
}

// Create course action (for the CreatePlaylistDialog)
export async function createCourse(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const courseCode = formData.get('courseCode') as string;
    
    const newCourse = await db.course.create({
      data: {
        title,
        description,
        courseCode,
        status: 'DRAFT',
        level: 'BEGINNER',
        visibility: 'PRIVATE',
        totalEnrollments: 0,
      },
    });
    
    revalidatePath('/my-courses');
    return { success: true, course: newCourse };
  } catch (error) {
    console.error('Failed to create course:', error);
    return { success: false, error: 'Failed to create course' };
  }
}