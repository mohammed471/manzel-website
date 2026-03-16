export default function CategoryLoading() {
  return (
    <div className="animate-pulse pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 mb-8">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-28 rounded" />
        </div>

        {/* Header skeleton */}
        <div className="mb-12 space-y-3">
          <div className="skeleton h-10 w-64 rounded" />
          <div className="skeleton h-5 w-96 max-w-full rounded" />
        </div>

        {/* Project grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="flex gap-4">
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
