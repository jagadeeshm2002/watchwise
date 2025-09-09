type CourseDetailsPageProps = {
  params: { id: string }
}

export default function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { id } = params;

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold">Course Details</h1>
        <p className="text-muted-foreground mt-2">Managing course with ID: <span className="font-mono">{id}</span></p>

        {/* TODO: Replace with management tabs/sections (Overview, Curriculum, Settings, etc.) */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded border p-4">
            <h2 className="font-medium">Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">Summary and stats.</p>
          </div>
          <div className="rounded border p-4">
            <h2 className="font-medium">Curriculum</h2>
            <p className="text-sm text-muted-foreground mt-1">Chapters and lessons.</p>
          </div>
          <div className="rounded border p-4">
            <h2 className="font-medium">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">Visibility, pricing, etc.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
