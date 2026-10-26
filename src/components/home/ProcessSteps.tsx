import { getTranslations } from "next-intl/server";
import { HardHat, KeyRound, PencilRuler, Store, type LucideIcon } from "lucide-react";
import Image from "@/components/SiteImage";
import AnimatedSection from "@/components/AnimatedSection";

const ICONS: LucideIcon[] = [PencilRuler, Store, HardHat, KeyRound];

export interface ProcessStep {
  id: string;
  title: string;
  text: string;
  image: string | null;
}

// «كيف نعمل» — numbered steps joined by a thin line (across on desktop, down the side on phones).
// Steps and their optional photos come from «واجهة الموقع»; no photo → a line icon.
export default async function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  if (steps.length === 0) return null;
  const t = await getTranslations("home");

  return (
    <section className="py-[72px] md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="reveal reveal-fadeIn text-3xl md:text-4xl text-primary leading-tight">{t("process_title")}</h2>
        <ol className="relative mt-10 md:mt-14 grid gap-10 md:gap-6 md:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ "--n": steps.length } as React.CSSProperties}>
          {/* The thread through the steps — on desktop from the first icon's centre to the last one's */}
          <span aria-hidden="true" className="absolute top-0 bottom-0 start-9 w-px bg-secondary-dark md:top-9 md:bottom-auto md:start-9 md:end-[calc((100%-(var(--n)-1)*1.5rem)/var(--n)-36px)] md:w-auto md:h-px" />
          {steps.map((step, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={step.id} className="relative">
                <AnimatedSection delay={i * 0.2} className="flex md:block gap-5">
                  <div className="relative shrink-0 w-[72px] h-[72px]">
                    <div className="relative w-full h-full rounded-2xl bg-secondary overflow-hidden flex items-center justify-center ring-8 ring-white">
                      {step.image ? (
                        <Image src={step.image} alt="" fill sizes="72px" className="object-cover" />
                      ) : (
                        <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                      )}
                    </div>
                    <span className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div className="md:mt-5">
                    <h3 className="text-lg md:text-xl font-bold text-text-primary">{step.title}</h3>
                    {step.text && <p className="mt-2 text-sm md:text-base leading-relaxed text-text-secondary">{step.text}</p>}
                  </div>
                </AnimatedSection>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
