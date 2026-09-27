"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, type LucideIcon } from "lucide-react";
import { submitContact } from "@/lib/api";
import { cn } from "@/lib/utils";

// Building blocks shared by the cost and area calculators (same look, same
// lead form — which posts to the internal app's contact messages).

export function OfferForm({ message, onClose }: { message: string; onClose: () => void }) {
  const t = useTranslations("calculator");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (status === "sent") {
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-bold text-success">
        <Check className="w-4 h-4" />
        {t("offer_success")}
      </p>
    );
  }

  return (
    <form
      className="space-y-3 rounded-2xl bg-secondary-light p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        const res = await submitContact({ name: name.trim(), phone: phone.trim(), email: "", message });
        setStatus(res.success ? "sent" : "error");
      }}
    >
      <div>
        <p className="text-sm font-bold text-primary">{t("offer_title")}</p>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">{t("offer_desc")}</p>
      </div>
      <label className="block">
        <span className="text-xs font-bold text-text-primary">{t("name_label")}</span>
        <input
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full h-11 rounded-xl border border-secondary-dark/60 bg-white px-3 text-base focus:outline-none focus:border-primary"
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-text-primary">{t("phone_label")}</span>
        <input
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full h-11 rounded-xl border border-secondary-dark/60 bg-white px-3 text-base text-start focus:outline-none focus:border-primary"
        />
      </label>
      {status === "error" && <p className="text-xs font-bold text-accent">{t("offer_error")}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex-1 h-11 rounded-full bg-primary text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-60 cursor-pointer"
        >
          {status === "sending" ? t("offer_sending") : t("offer_submit")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-full px-4 text-sm font-medium text-text-secondary hover:bg-white cursor-pointer"
        >
          {t("close")}
        </button>
      </div>
    </form>
  );
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white border border-secondary-dark/40 p-5 md:p-7">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl md:text-2xl text-primary">{title}</h2>
        {hint && <p className="text-xs text-text-secondary">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function OptionCard({
  role,
  selected,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  role: "radio" | "checkbox";
  selected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "relative flex items-start gap-3 rounded-2xl border p-4 text-start transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected ? "border-primary bg-primary/[0.05]" : "border-secondary-dark/60 bg-white hover:border-primary/40",
      )}
    >
      <span
        className={cn(
          "flex w-10 h-10 shrink-0 items-center justify-center rounded-xl transition-colors",
          selected ? "bg-primary text-white" : "bg-primary/[0.07] text-primary",
        )}
      >
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-text-primary">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">{desc}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex w-5 h-5 shrink-0 items-center justify-center border transition-colors",
          role === "radio" ? "rounded-full" : "rounded-md",
          selected ? "border-primary bg-primary text-white" : "border-secondary-dark",
        )}
      >
        {selected && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

export function Segmented<T extends string | number | boolean>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("inline-flex rounded-full bg-secondary-light p-1", className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-10 min-w-11 rounded-full px-4 text-sm font-bold transition-colors cursor-pointer",
            value === o.value ? "bg-primary text-white" : "text-text-secondary hover:text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
