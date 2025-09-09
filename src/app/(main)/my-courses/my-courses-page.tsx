// app/my-courses/MyCoursesPage.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import CourseCard  from './course-card';
import { CreatePlaylistDialog } from '@/components/course/create-playlist-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BookOpen, Globe, Edit3, Users, Search, Plus } from 'lucide-react';
import { CourseStatus, CourseLevel, CourseVisibility } from '@/generated/prisma';
import { deleteCourse, duplicateCourse } from './actions';

interface MyCoursesPageProps {
  courses: Course[];
  searchQuery: string;
  statusFilter: string;
  levelFilter: string;
  visibilityFilter: string;
}

export function MyCoursesPage({ 
  courses, 
  searchQuery, 
  statusFilter, 
  levelFilter, 
  visibilityFilter 
}: MyCoursesPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Calculate stats
  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === CourseStatus.PUBLISHED).length,
    draft: courses.filter((c) => c.status === CourseStatus.DRAFT).length,
    totalEnrollments: courses.reduce((sum, c) => sum + c.totalEnrollments, 0),
  };

  // Update URL with new filters
  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    
    if (newFilters.search !== undefined) params.set('search', newFilters.search);
    if (newFilters.status !== undefined) params.set('status', newFilters.status);
    if (newFilters.level !== undefined) params.set('level', newFilters.level);
    if (newFilters.visibility !== undefined) params.set('visibility', newFilters.visibility);
    
    // Update URL without page reload but triggers server component re-render
    router.push(`/my-courses?${params.toString()}`, { scroll: false });
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    updateFilters({ 
      search: value, 
      status: statusFilter, 
      level: levelFilter, 
      visibility: visibilityFilter 
    });
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    updateFilters({ 
      search: searchQuery, 
      status: value, 
      level: levelFilter, 
      visibility: visibilityFilter 
    });
  };

  const handleLevelFilterChange = (value: string) => {
    updateFilters({ 
      search: searchQuery, 
      status: statusFilter, 
      level: value, 
      visibility: visibilityFilter 
    });
  };

  const handleVisibilityFilterChange = (value: string) => {
    updateFilters({ 
      search: searchQuery, 
      status: statusFilter, 
      level: levelFilter, 
      visibility: value 
    });
  };

  // Server actions handlers
  const handleDeleteCourse = async (courseId: string) => {
    startTransition(async () => {
      await deleteCourse(courseId);
      // Revalidate the page to reflect changes
      router.refresh();
    });
  };

  const handleDuplicateCourse = async (courseId: string) => {
    startTransition(async () => {
      await duplicateCourse(courseId);
      // Revalidate the page to reflect changes
      router.refresh();
    });
  };

  // Client-side handlers
  const handleEditCourse = (courseId: string) => {
    // Navigate to edit page
    router.push(`/course/${courseId}/edit`);
  };

  const handleViewAnalytics = (courseId: string) => {
    // Navigate to analytics page
    router.push(`/course/${courseId}/analytics`);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Courses
            </h1>
            <p className="text-gray-600">
              Create and manage your educational content
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreatePlaylistDialog onCourseCreated={() => router.refresh()}>
              <Button variant="default">Create a course</Button>
            </CreatePlaylistDialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.published}
                </p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.draft}
                </p>
              </div>
              <Edit3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalEnrollments}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={CourseStatus.PUBLISHED}>
                    Published
                  </SelectItem>
                  <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={CourseStatus.ARCHIVED}>
                    Archived
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={handleLevelFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value={CourseLevel.BEGINNER}>Beginner</SelectItem>
                  <SelectItem value={CourseLevel.INTERMEDIATE}>
                    Intermediate
                  </SelectItem>
                  <SelectItem value={CourseLevel.ADVANCED}>Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={visibilityFilter}
                onValueChange={handleVisibilityFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value={CourseVisibility.PUBLIC}>
                    Public
                  </SelectItem>
                  <SelectItem value={CourseVisibility.PRIVATE}>
                    Private
                  </SelectItem>
                  <SelectItem value={CourseVisibility.UNLISTED}>
                    Unlisted
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ||
              statusFilter !== "all" ||
              levelFilter !== "all" ||
              visibilityFilter !== "all"
                ? "No courses match your filters"
                : "No courses yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ||
              statusFilter !== "all" ||
              levelFilter !== "all" ||
              visibilityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first course to get started"}
            </p>
            {!(
              searchQuery ||
              statusFilter !== "all" ||
              levelFilter !== "all" ||
              visibilityFilter !== "all"
            ) && (
              <CreatePlaylistDialog onCourseCreated={() => router.refresh()}>
                <Button>
                  <Plus className="w-5 h-5" />
                  Create Your First Course
                </Button>
              </CreatePlaylistDialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onDuplicate={handleDuplicateCourse}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}