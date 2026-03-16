export default function ProjectCardSkeleton() {
  return (
    <div className="block">
      <div className="relative aspect-[4/3] rounded-xl skeleton mb-3" />
      <div className="h-5 w-3/4 skeleton mb-2" />
      <div className="h-4 w-1/2 skeleton" />
    </div>
  );
}
