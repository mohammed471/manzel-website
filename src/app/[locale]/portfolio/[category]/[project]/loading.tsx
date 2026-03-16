export default function ProjectLoading() {
  return (
    <div className="animate-pulse pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 mb-8">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>

        {/* Hero image skeleton */}
        <div className="skeleton aspect-[16/9] md:aspect-[2/1] rounded-2xl mb-10" />

        {/* Title skeleton */}
        <div className="skeleton h-10 w-72 max-w-full rounded mb-4" />

        {/* Info badges skeleton */}
        <div className="flex flex-wrap gap-3 mb-10">
          <div className="skeleton h-9 w-28 rounded-full" />
          <div className="skeleton h-9 w-24 rounded-full" />
          <div className="skeleton h-9 w-20 rounded-full" />
        </div>

        {/* Two-column layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Description skeleton */}
          <div className="lg:col-span-2 space-y-3">
            <div className="skeleton h-6 w-40 rounded mb-4" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl p-6 space-y-4">
              <div className="skeleton h-4 w-32 rounded" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-secondary-dark/30 pb-3"
                >
                  <div className="skeleton h-4 w-16 rounded" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              ))}
              <div className="skeleton h-11 w-full rounded-xl mt-4" />
            </div>
          </div>
        </div>

        {/* Gallery skeleton */}
        <div className="mb-16">
          <div className="skeleton h-6 w-32 rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
