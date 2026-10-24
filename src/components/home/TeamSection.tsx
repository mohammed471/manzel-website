import { getLocale, getTranslations } from "next-intl/server";
import Image from "@/components/SiteImage";
import AnimatedSection from "@/components/AnimatedSection";
import { getAboutContent } from "@/lib/about";

// «الأشخاص خلف منزل» — only team members with a real photo (internal app → صفحة من نحن → الفريق).
// Nobody with a photo → the section is not rendered.
export default async function TeamSection() {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const { team } = await getAboutContent(locale);
  const people = team.filter((m) => m.imageUrl);
  if (people.length === 0) return null;

  return (
    <section className="py-[72px] md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="reveal reveal-fadeIn mb-8 md:mb-10 text-3xl md:text-4xl text-primary leading-tight">{t("team_title")}</h2>
        </AnimatedSection>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {people.map((m) => (
            <li key={m.id}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary">
                <Image
                  src={m.imageUrl!}
                  alt={m.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-3 font-bold text-text-primary">{m.name}</h3>
              {m.role && <p className="text-sm text-text-secondary">{m.role}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
