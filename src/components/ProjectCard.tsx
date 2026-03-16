import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { PortfolioProject } from "@/lib/portfolio";
import { getProjectImageUrl } from "@/lib/portfolio";

export default function ProjectCard({
  project,
}: {
  project: PortfolioProject;
  locale: string;
}) {
  const coverUrl = getProjectImageUrl(
    project.category,
    project.id,
    project.images[0] || "cover.jpg",
  );

  return (
    <Link
      href={`/portfolio/${project.category}/${project.id}`}
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary mb-3">
        <Image
          src={coverUrl}
          alt={project.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Fallback for missing images */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dark/30 flex items-center justify-center -z-10">
          <svg
            className="w-12 h-12 text-primary/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        </div>
      </div>

      {/* Text below image */}
      <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
        {project.name}
      </h3>
      <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
        <span>{project.location}</span>
        <span className="text-secondary-dark">|</span>
        <span>{project.year}</span>
      </div>
    </Link>
  );
}
