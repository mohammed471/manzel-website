"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import ShareButtons from "@/components/ShareButtons";
import { buttonClasses } from "@/components/ui/Button";
import { surfaceClasses } from "@/components/ui/Surface";
import { trackGA4Event } from "@/lib/analytics";
import { boardHref, boardMessage, boardParam, isSaved, parseBoard } from "@/lib/board";
import { useBoard, useHydrated, writeBoard } from "@/lib/boardStore";
import { cn } from "@/lib/utils";

// What can be done with the board on screen: send it to Manzel on WhatsApp, share
// it, and — depending on whose it is — clear it or copy it into mine.
//
// The link carries no "this is shared" mark, so a link copied from the address bar
// works like the share button's. Whose board it is comes from comparing the link
// with what this browser holds: equal = mine, and then the link follows my hearts;
// anything else = someone's board, shown as it is and never written over mine.
// The page keys this component by `param`, so that memory starts fresh per link.
export default function BoardActions({
  param,
  labels,
  shareUrl,
}: {
  /** The board in the link, as the server read it */
  param: string;
  /** One line per item for the WhatsApp message */
  labels: string[];
  shareUrl: string;
}) {
  const t = useTranslations("board");
  const tSite = useTranslations("site");
  const router = useRouter();
  const hydrated = useHydrated();
  const mine = useBoard();
  const mineParam = boardParam(mine);

  // Stays true after a heart is removed: that changes my board, not whose board this is
  const [isMine, setIsMine] = useState(false);
  if (hydrated && !isMine && mineParam === param) setIsMine(true);

  // My board changed while I'm looking at it — or /board was opened without one
  useEffect(() => {
    if (hydrated && boardParam(mine) !== param && (isMine || !param)) {
      router.replace(boardHref(mine), { scroll: false });
    }
  }, [hydrated, isMine, mine, param, router]);

  if (!param) return null;

  const message = boardMessage({
    intro: t("wa_intro"),
    labels,
    more: (count) => t("wa_more", { count: String(count) }),
    url: shareUrl,
  });

  return (
    <div className={cn(surfaceClasses("white"), "mb-6 md:mb-8 p-5 md:p-6")}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-sm md:text-base leading-relaxed text-text-secondary">{t("hint")}</p>
        <a
          href={`https://wa.me/${tSite("whatsapp")}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGA4Event("board_send", { items: labels.length })}
          className="inline-flex h-13 shrink-0 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 text-base font-bold text-white transition-colors hover:bg-[#20BD5A]"
        >
          <MessageCircle className="w-5 h-5" />
          {t("send")}
        </a>
      </div>

      <ShareButtons
        url={shareUrl}
        title={t("share_title")}
        description={t("share_text")}
        heading={t("share_heading")}
        text={t("share_text")}
      />

      {/* Decided in the browser, so empty in the server HTML — the height is reserved */}
      <div className="mt-4 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-t border-secondary-dark/30 pt-4">
        {hydrated &&
          (isMine ? (
            <button
              type="button"
              onClick={() => window.confirm(t("clear_confirm")) && writeBoard([])}
              className={buttonClasses("ghost", "sm")}
            >
              {t("clear")}
            </button>
          ) : (
            <>
              <span className="text-sm font-bold text-text-primary">{t("shared_label")}</span>
              {parseBoard(param).some((entry) => !isSaved(mine, entry)) && (
                <button
                  type="button"
                  // Theirs first; what I already saved stays
                  onClick={() => writeBoard(parseBoard(`${param}~${mineParam}`))}
                  className={buttonClasses("outline", "sm")}
                >
                  {t("save_all")}
                </button>
              )}
              {mine.length > 0 && (
                <Link href={boardHref(mine)} prefetch={false} className={buttonClasses("ghost", "sm")}>
                  {t("open_mine", { count: String(mine.length) })}
                </Link>
              )}
            </>
          ))}
      </div>
    </div>
  );
}
