export default function ProductCardSkeleton() {
  return (
    <div className="block">
      <div className="relative aspect-[3/4] skeleton" />
      <div className="pt-4">
        <div className="h-3 w-16 skeleton mb-2" />
        <div className="h-5 w-3/4 skeleton" />
      </div>
    </div>
  );
}
