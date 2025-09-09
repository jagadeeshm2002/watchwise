// app/my-courses/page.tsx
import { redirect } from 'next/navigation';
import { MyCoursesPage } from './my-courses-page';
import { getCourses } from './actions';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get filter values from URL search params
  const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : '';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const levelFilter = typeof searchParams.level === 'string' ? searchParams.level : 'all';
  const visibilityFilter = typeof searchParams.visibility === 'string' ? searchParams.visibility : 'all';

  // Fetch courses from the server
  const courses = await getCourses({
    searchQuery,
    statusFilter,
    levelFilter,
    visibilityFilter,
  });

  return (
    <MyCoursesPage
      courses={courses}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      levelFilter={levelFilter}
      visibilityFilter={visibilityFilter}
    />
  );
}