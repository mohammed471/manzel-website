export default function ProductsLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero placeholder */}
      <div className="h-64 bg-secondary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter bar skeleton */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="skeleton h-10 w-24 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-10 w-28 rounded-lg" />
          <div className="skeleton h-10 w-36 rounded-lg" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton aspect-square" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
