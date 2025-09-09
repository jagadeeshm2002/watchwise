type EditCoursePageProps = {
  params: { id: string }
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = params;

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">Edit Course</h1>
        <p className="text-muted-foreground mt-2">Editing course with ID: <span className="font-mono">{id}</span></p>

        {/* TODO: Add edit form for course details */}
        <div className="mt-6 rounded border p-6">
          <p>Course edit form goes here.</p>
        </div>
      </div>
    </main>
  );
}
