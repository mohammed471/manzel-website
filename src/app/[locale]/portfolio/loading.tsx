export default function PortfolioLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero placeholder */}
      <div className="h-80 bg-secondary" />

      {/* Stats bar skeleton */}
      <div className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="skeleton h-8 w-16 mx-auto rounded" />
                <div className="skeleton h-4 w-24 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="skeleton h-8 w-48 mx-auto mb-10 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-5 w-2/3 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
