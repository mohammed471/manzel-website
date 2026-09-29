import Image from "@/components/SiteImage";
import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AnimatedSection from "@/components/AnimatedSection";
import SectionHeader from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { getProjectImageUrl, type PortfolioProject } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

function ProjectTile({ project, className }: { project: PortfolioProject; className?: string }) {
  const cover = getProjectImageUrl(project.category, project.id, project.images[0] || "cover.jpg");
  return (
    <Link href={`/portfolio/${project.category}/${project.id}`} className={cn("group block", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-primary-dark/30">
        <Image
          src={cover}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 85vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-4 px-1">
        <h3 className="text-lg text-text-primary transition-colors group-hover:text-primary">{project.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin className="w-3.5 h-3.5" />
          {project.location}
          <span className="text-secondary-dark">•</span>
          {project.year}
        </p>
      </div>
    </Link>
  );
}

export default async function ProjectsShowcase({ projects }: { projects: PortfolioProject[] }) {
  const t = await getTranslations("home");
  if (projects.length === 0) return null;

  const header = (
    <AnimatedSection>
      <SectionHeader
        badge={t("latest_work")}
        title={t("featured_projects")}
        action={
          <ButtonLink href="/portfolio" variant="outline" size="md">
            {t("view_more")}
          </ButtonLink>
        }
      />
    </AnimatedSection>
  );

  return (
    <section id="projects" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-36">
      <div className="max-w-7xl mx-auto">
        {header}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p, i) => (
            <AnimatedSection key={p.id} delay={i * 0.08}>
              <ProjectTile project={p} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
