import Image from "next/image";
import { getTranslations } from "next-intl/server";

// First-visit-per-session splash, ~1s, pure CSS (`.splash` in globals.css).
// It is in the server HTML so it paints with the first frame and fades out on
// its own — the old client version only appeared after hydration (~4s on a slow
// phone), covering a page that was already visible and pushing LCP to ~5s.
// SPLASH_BOOT_SCRIPT (head) hides it on repeat visits and lets a tap skip it;
// reduced-motion users never see it.
export default async function SplashScreen() {
  const t = await getTranslations("splash");
  return (
    <div className="splash" role="status" aria-label={t("skip_hint")}>
      <div className="splash-content">
        <Image
          src="/images/logo-dark.png"
          alt="Manzel"
          width={180}
          height={140}
          className="w-[110px] md:w-[150px] h-auto"
          priority
        />
        <p className="splash-tagline mt-5 text-sm md:text-base font-medium text-primary/70">{t("tagline")}</p>
      </div>
      <div className="absolute bottom-16 w-28 md:w-40 h-[3px] rounded-full bg-primary/10 overflow-hidden">
        <div className="splash-bar h-full w-full bg-primary rounded-full" />
      </div>
    </div>
  );
}
