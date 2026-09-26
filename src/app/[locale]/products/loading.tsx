// Mirrors the catalogue layout (hero, category column, 2–4 col grid) so the
// page doesn't jump when data arrives.
export default function ProductsLoading() {
  return (
    <div>
      <div className="px-3 sm:px-4 lg:px-6 pt-3">
        <div className="h-72 md:h-80 rounded-[2rem] md:rounded-[2.5rem] bg-primary/90" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6 lg:gap-10">
        <div className="flex gap-2 overflow-hidden lg:flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-11 w-32 shrink-0 rounded-full lg:w-full lg:rounded-xl" />
          ))}
        </div>
        <div>
          <div className="skeleton h-8 w-48 rounded-lg mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl bg-white border border-secondary-dark/40">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2.5">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
