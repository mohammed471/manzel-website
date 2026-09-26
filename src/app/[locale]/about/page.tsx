import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Award, Eye, Lightbulb, Clock } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/ui/PageHero";
import TrustSection from "@/components/home/TrustSection";
import ClosingCTA from "@/components/home/ClosingCTA";
import Timeline from "@/components/Timeline";
import { getTimeline, getTeam, getValues, getTeamMemberImageUrl } from "@/lib/about";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const isAR = locale === "ar";

  return {
    title: t("about_title"),
    description: t("about_description"),
    openGraph: {
      title: t("about_title"),
      description: t("about_description"),
      type: "website",
      locale: isAR ? "ar_IQ" : "en_US",
    },
  };
}

const iconMap: Record<string, typeof Award> = {
  award: Award,
  lightbulb: Lightbulb,
  clock: Clock,
  eye: Eye,
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tStats = await getTranslations("stats");

  const timeline = getTimeline();
  const team = getTeam();
  const values = getValues();

  const timelineItems = timeline.map((item, i) => ({
    year: item.year,
    title: t(`timeline_${i + 1}_title`),
    description: t(`timeline_${i + 1}_description`),
  }));

  const stats = [
    { numberText: tStats("products_count"), label: tStats("products_label") },
    { numberText: tStats("projects_count"), label: tStats("projects_label") },
    { numberText: tStats("years_count"), label: tStats("years_label") },
    { numberText: tStats("clients_count"), label: tStats("clients_label") },
  ];

  return (
    <>
      <PageHero badge={t("hero_label")} title={t("hero_title")} description={t("hero_description")} />

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <AnimatedSection variant="slideRight">
              <div>
                <span className="text-accent font-bold text-sm tracking-wider uppercase">
                  {t("story_subtitle")}
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
                  {t("story_title")}
                </h2>
                <div className="w-16 h-1 bg-accent mt-4 rounded-full" />
                <p className="mt-6 text-text-secondary leading-relaxed text-lg">
                  {t("story_text")}
                </p>
              </div>
            </AnimatedSection>

            {/* Right Column — Mission & Vision Cards */}
            <AnimatedSection delay={0.2} variant="fadeIn">
              <div className="space-y-6">
                {/* Mission Card */}
                <div className="bg-surface rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {t("mission_title")}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {t("mission_text")}
                  </p>
                </div>

                {/* Vision Card */}
                <div className="bg-surface rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {t("vision_title")}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {t("vision_text")}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-accent font-bold text-sm tracking-wider uppercase">
                {t("timeline_subtitle")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
                {t("timeline_title")}
              </h2>
              <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            </div>
          </AnimatedSection>
          <Timeline items={timelineItems} />
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-accent font-bold text-sm tracking-wider uppercase">
                {t("team_subtitle")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
                {t("team_title")}
              </h2>
              <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, i) => {
              const name = t(`team_${i + 1}_name`);
              const role = t(`team_${i + 1}_role`);
              const initial = name.charAt(0);

              return (
                <AnimatedSection key={member.id} delay={i * 0.15} variant="scaleIn">
                  <div className="bg-surface rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                    {/* Avatar / Initials */}
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {member.image ? (
                        <Image
                          src={getTeamMemberImageUrl(member.image)}
                          alt={name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          onError={undefined}
                        />
                      ) : (
                        <span className="text-3xl font-bold text-primary">
                          {initial}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-text-primary">
                      {name}
                    </h3>
                    <p className="text-text-secondary text-sm mt-1">
                      {role}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-14">
              <span className="text-accent font-bold text-sm tracking-wider uppercase">
                {t("values_subtitle")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-2">
                {t("values_title")}
              </h2>
              <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const IconComponent = iconMap[value.icon] || Award;

              return (
                <AnimatedSection key={value.icon} delay={i * 0.1}>
                  <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-secondary-dark/20">
                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-bold text-text-primary mt-2">
                      {t(`value_${i + 1}_title`)}
                    </h3>
                    <p className="text-text-secondary text-sm mt-2">
                      {t(`value_${i + 1}_description`)}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <TrustSection stats={stats} testimonials={[]} />

      <ClosingCTA title={t("cta_title")} description={t("cta_description")} />
    </>
  );
}
