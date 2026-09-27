import { getTranslations } from "next-intl/server";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { telHref } from "@/lib/siteContent";

const SOCIAL_ICONS = [
  { key: "facebook", label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { key: "instagram", label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { key: "whatsapp", label: "WhatsApp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
];

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tContact = await getTranslations("contact");
  const tSite = await getTranslations("site");
  const socials = SOCIAL_ICONS.map((s) => ({
    ...s,
    href: s.key === "whatsapp" ? `https://wa.me/${tSite("whatsapp")}` : tSite(s.key),
  }));

  const columns = [
    {
      title: t("quick_links"),
      links: [
        { href: "/", label: tNav("home") },
        { href: "/products", label: tNav("products") },
        { href: "/portfolio", label: tNav("portfolio") },
        { href: "/about", label: tNav("about") },
        { href: "/testimonials", label: tNav("testimonials") },
        { href: "/contact", label: tNav("contact") },
      ],
    },
    {
      title: tNav("tools"),
      links: [
        { href: "/calculator", label: tNav("calculator") },
        { href: "/area-calculator", label: tNav("area_calculator") },
        { href: "/color-picker", label: tNav("color_picker") },
        { href: "/booking", label: tNav("booking") },
      ],
    },
  ];

  const contact = [
    { icon: Phone, href: telHref(tSite("phone_1")), label: tSite("phone_1"), ltr: true },
    ...(tSite("phone_2").trim() ? [{ icon: Phone, href: telHref(tSite("phone_2")), label: tSite("phone_2"), ltr: true }] : []),
    { icon: Mail, href: `mailto:${tSite("email")}`, label: tSite("email"), ltr: true },
    { icon: MapPin, href: tSite("map_url"), label: tContact("address_value") },
    { icon: Clock, label: tContact("working_hours_value") },
  ];

  return (
    <footer className="px-3 sm:px-4 lg:px-6 pt-6">
      <div className="relative overflow-hidden rounded-t-[2rem] md:rounded-t-[2.5rem] bg-primary-dark text-white">
        <div className="pointer-events-none absolute -top-32 -end-32 w-96 h-96 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-40 -start-24 w-[28rem] h-[28rem] rounded-full border border-white/[0.05]" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 md:pt-20 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-12">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-4">
              <Logo variant="light" width={96} height={60} />
              <p className="mt-6 text-sm leading-relaxed text-white/65 max-w-sm">{t("company_description")}</p>
              <div className="mt-6 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white/80 transition-colors hover:bg-accent hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {columns.map((col) => (
              <div key={col.title} className="lg:col-span-2">
                <h3 className="text-base text-white">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-white/65 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="col-span-2 lg:col-span-4">
              <h3 className="text-base text-white">{t("contact_us")}</h3>
              <ul className="mt-5 space-y-3.5">
                {contact.map(({ icon: Icon, href, label, ltr }) => {
                  const content = (
                    <>
                      <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.08] text-accent-light">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span dir={ltr ? "ltr" : undefined} className="pt-1.5">
                        {label}
                      </span>
                    </>
                  );
                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="flex items-start gap-3 text-sm text-white/65 transition-colors hover:text-white"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-start gap-3 text-sm text-white/65">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-14 pt-6 border-t border-white/10 text-center sm:text-start">
            <p className="text-xs text-white/60">{t("copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
