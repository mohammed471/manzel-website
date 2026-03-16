import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white bg-geometric px-4">
      <div className="text-center max-w-lg">
        <p className="text-9xl font-extrabold text-primary/10 select-none">404</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary -mt-6">
          {t("page_not_found")}
        </h1>
        <p className="mt-4 text-lg text-text-secondary leading-relaxed">
          {t("page_not_found_desc")}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          {t("back_to_home")}
        </Link>
      </div>
    </div>
  );
}
