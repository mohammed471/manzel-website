"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { trackGA4Event } from "@/lib/analytics";
import {
  calculateEstimate,
  OPTION_PRICES,
  type ProjectType,
  type PropertyType,
  type QualityLevel,
  type AdditionalOption,
} from "@/lib/calculator";

type Step = 1 | 2 | 3 | 4 | 5 | "result";

const PROJECT_TYPES: ProjectType[] = [
  "interior_design",
  "exterior_design",
  "full_execution",
  "finishing",
  "plans",
];

const PROPERTY_TYPES: PropertyType[] = [
  "house_villa",
  "apartment",
  "office_commercial",
  "cafe_restaurant",
  "other",
];

const QUALITY_LEVELS: QualityLevel[] = ["standard", "premium", "luxury"];

const ADDITIONAL_OPTIONS: AdditionalOption[] = [
  "3d_design",
  "supervision",
  "full_furnishing",
  "smart_lighting",
  "sound_system",
];

// SVG icons for project types
function ProjectIcon({
  type,
  className,
}: {
  type: ProjectType;
  className?: string;
}) {
  const cls = cn("w-8 h-8", className);
  switch (type) {
    case "interior_design":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      );
    case "exterior_design":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      );
    case "full_execution":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.42 15.17l-5.1-5.1a2.25 2.25 0 010-3.18l.71-.71a2.25 2.25 0 013.18 0l.71.71.71-.71a2.25 2.25 0 013.18 0l.71.71a2.25 2.25 0 010 3.18l-5.1 5.1a.75.75 0 01-1.06 0zM20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0H9m3 0h3"
          />
        </svg>
      );
    case "finishing":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
          />
        </svg>
      );
    case "plans":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      );
  }
}

// SVG icons for property types
function PropertyIcon({
  type,
  className,
}: {
  type: PropertyType;
  className?: string;
}) {
  const cls = cn("w-8 h-8", className);
  switch (type) {
    case "house_villa":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
          />
        </svg>
      );
    case "apartment":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"
          />
        </svg>
      );
    case "office_commercial":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      );
    case "cafe_restaurant":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
          />
        </svg>
      );
    case "other":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75l-5.571-3m11.142 0l4.179 2.25L12 17.25l-9.75-5.25 4.179-2.25m11.142 0l4.179 2.25L12 22.5l-9.75-5.25 4.179-2.25"
          />
        </svg>
      );
  }
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function Calculator() {
  const t = useTranslations("calculator");
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [area, setArea] = useState(150);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel | null>(null);
  const [additionalOptions, setAdditionalOptions] = useState<
    AdditionalOption[]
  >([]);

  // Animated counter refs
  const [displayLow, setDisplayLow] = useState(0);
  const [displayHigh, setDisplayHigh] = useState(0);
  const animationRef = useRef<number | null>(null);

  const numericStep = typeof step === "number" ? step : 5;

  const stepTitles: Record<number, string> = {
    1: t("step_1_title"),
    2: t("step_2_title"),
    3: t("step_3_title"),
    4: t("step_4_title"),
    5: t("step_5_title"),
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return projectType !== null;
      case 2:
        return propertyType !== null;
      case 3:
        return area >= 50 && area <= 1000;
      case 4:
        return qualityLevel !== null;
      case 5:
        return true; // Optional step
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canProceed()) return;
    setDirection(1);
    if (step === 5) {
      setStep("result");
    } else if (typeof step === "number") {
      setStep((step + 1) as Step);
    }
  };

  const goBack = () => {
    setDirection(-1);
    if (step === "result") {
      setStep(5);
    } else if (typeof step === "number" && step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const resetCalculator = () => {
    setDirection(-1);
    setStep(1);
    setProjectType(null);
    setPropertyType(null);
    setArea(150);
    setQualityLevel(null);
    setAdditionalOptions([]);
    setDisplayLow(0);
    setDisplayHigh(0);
  };

  const toggleOption = (option: AdditionalOption) => {
    setAdditionalOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  // Animate counter on result screen
  useEffect(() => {
    if (step !== "result" || !projectType || !propertyType || !qualityLevel)
      return;

    const result = calculateEstimate({
      projectType,
      propertyType,
      area,
      qualityLevel,
      additionalOptions,
    });

    trackGA4Event("calculator_complete", { estimate: result.high });

    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setDisplayLow(Math.round(eased * result.low));
      setDisplayHigh(Math.round(eased * result.high));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [step, projectType, propertyType, area, qualityLevel, additionalOptions]);

  const getProjectName = (type: ProjectType) =>
    t(`project_${type}` as Parameters<typeof t>[0]);
  const getPropertyName = (type: PropertyType) =>
    t(`property_${type}` as Parameters<typeof t>[0]);
  const getQualityName = (level: QualityLevel) =>
    t(`quality_${level}` as Parameters<typeof t>[0]);
  const getOptionName = (option: AdditionalOption) =>
    t(`option_${option}` as Parameters<typeof t>[0]);

  // WhatsApp message builder
  const buildWhatsAppUrl = () => {
    if (!projectType || !propertyType || !qualityLevel) return "#";

    const result = calculateEstimate({
      projectType,
      propertyType,
      area,
      qualityLevel,
      additionalOptions,
    });

    const optionsText =
      additionalOptions.length > 0
        ? additionalOptions.map(getOptionName).join(", ")
        : t("summary_none");

    const message = t("whatsapp_message", {
      projectType: getProjectName(projectType),
      propertyType: getPropertyName(propertyType),
      area: String(area),
      qualityLevel: getQualityName(qualityLevel),
      options: optionsText,
      estimate: `$${result.low.toLocaleString()} - $${result.high.toLocaleString()}`,
    });

    return `https://wa.me/9647737685000?text=${encodeURIComponent(message)}`;
  };

  // Progress indicator
  const renderProgress = () => {
    if (step === "result") return null;

    return (
      <div className="mb-10">
        {/* Step counter text */}
        <p className="text-sm text-text-secondary text-center mb-4">
          {t("step_of", { current: numericStep, total: 5 })}
        </p>

        {/* Dots */}
        <div className="flex items-center justify-center gap-0">
          {[1, 2, 3, 4, 5].map((s, i) => (
            <div key={s} className="flex items-center">
              {/* Dot */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                      s < numericStep &&
                        "bg-primary text-white",
                      s === numericStep &&
                        "bg-accent text-white",
                      s > numericStep &&
                        "bg-gray-200 text-gray-400"
                    )}
                  >
                    {s < numericStep ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>
                  {/* Pulse ring for current step */}
                  {s === numericStep && (
                    <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-20" />
                  )}
                </div>
                {/* Step label */}
                <span
                  className={cn(
                    "text-[10px] mt-1.5 whitespace-nowrap hidden sm:block",
                    s === numericStep
                      ? "text-accent font-semibold"
                      : "text-text-secondary"
                  )}
                >
                  {stepTitles[s]}
                </span>
              </div>

              {/* Connector line */}
              {i < 4 && (
                <div
                  className={cn(
                    "w-8 sm:w-12 h-0.5 mx-1 transition-all duration-300",
                    s < numericStep ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Step 1: Project Type
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        {t("step_1_title")}
      </h2>
      <p className="text-text-secondary text-sm mb-6">
        {t("description")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PROJECT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setProjectType(type)}
            className={cn(
              "rounded-xl p-6 cursor-pointer transition-all text-center border",
              projectType === type
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-gray-200 hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "mx-auto mb-3",
                projectType === type ? "text-primary" : "text-text-secondary"
              )}
            >
              <ProjectIcon type={type} className="mx-auto" />
            </div>
            <span
              className={cn(
                "text-sm font-semibold block",
                projectType === type ? "text-primary" : "text-text-primary"
              )}
            >
              {getProjectName(type)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Property Type
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        {t("step_2_title")}
      </h2>
      <p className="text-text-secondary text-sm mb-6">
        {t("description")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PROPERTY_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setPropertyType(type)}
            className={cn(
              "rounded-xl p-6 cursor-pointer transition-all text-center border",
              propertyType === type
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-gray-200 hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "mx-auto mb-3",
                propertyType === type ? "text-primary" : "text-text-secondary"
              )}
            >
              <PropertyIcon type={type} className="mx-auto" />
            </div>
            <span
              className={cn(
                "text-sm font-semibold block",
                propertyType === type ? "text-primary" : "text-text-primary"
              )}
            >
              {getPropertyName(type)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 3: Area
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        {t("step_3_title")}
      </h2>
      <p className="text-text-secondary text-sm mb-8">
        {t("area_label")}
      </p>

      {/* Large display */}
      <div className="text-center mb-8">
        <span className="text-5xl md:text-6xl font-extrabold text-primary">
          {area}
        </span>
        <span className="text-2xl text-text-secondary ms-2">
          {t("area_unit")}
        </span>
      </div>

      {/* Range slider */}
      <div className="px-2 mb-6">
        <input
          type="range"
          min={50}
          max={1000}
          step={10}
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
          className="w-full"
          dir="ltr"
        />
        <div className="flex justify-between text-xs text-text-secondary mt-2" dir="ltr">
          <span>50 {t("area_unit")}</span>
          <span>1000 {t("area_unit")}</span>
        </div>
      </div>

      {/* Number input */}
      <div className="flex justify-center">
        <div className="relative">
          <input
            type="number"
            min={50}
            max={1000}
            step={10}
            value={area}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 50 && val <= 1000) setArea(val);
            }}
            className="w-32 text-center border border-gray-200 rounded-xl py-3 px-4 text-lg font-semibold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            dir="ltr"
          />
          <span className="absolute top-1/2 -translate-y-1/2 end-3 text-sm text-text-secondary pointer-events-none">
            {t("area_unit")}
          </span>
        </div>
      </div>
    </div>
  );

  // Step 4: Quality Level
  const renderStep4 = () => {
    const priceIndicators: Record<QualityLevel, string> = {
      standard: "$",
      premium: "$$",
      luxury: "$$$",
    };

    return (
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {t("step_4_title")}
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          {t("description")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {QUALITY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setQualityLevel(level)}
              className={cn(
                "rounded-xl p-6 cursor-pointer transition-all text-center border",
                qualityLevel === level
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "text-2xl font-bold mb-2",
                  qualityLevel === level ? "text-accent" : "text-text-secondary"
                )}
              >
                {priceIndicators[level]}
              </div>
              <span
                className={cn(
                  "text-lg font-bold block mb-1",
                  qualityLevel === level ? "text-primary" : "text-text-primary"
                )}
              >
                {getQualityName(level)}
              </span>
              <span className="text-xs text-text-secondary block mb-2">
                {t(`quality_${level}_label` as Parameters<typeof t>[0])}
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t(`quality_${level}_desc` as Parameters<typeof t>[0])}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Step 5: Additional Options
  const renderStep5 = () => (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        {t("step_5_title")}
      </h2>
      <p className="text-text-secondary text-sm mb-6">
        {t("option_skip")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ADDITIONAL_OPTIONS.map((option) => {
          const isSelected = additionalOptions.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "rounded-xl p-5 cursor-pointer transition-all text-start border flex items-center gap-4",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/30"
              )}
            >
              {/* Checkbox indicator */}
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-gray-300"
                )}
              >
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "font-semibold text-sm block",
                    isSelected ? "text-primary" : "text-text-primary"
                  )}
                >
                  {getOptionName(option)}
                </span>
                <span className="text-xs text-text-secondary" dir="ltr">
                  ${OPTION_PRICES[option].toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Result Screen
  const renderResult = () => {
    if (!projectType || !propertyType || !qualityLevel) return null;

    const optionsText =
      additionalOptions.length > 0
        ? additionalOptions.map(getOptionName).join(", ")
        : t("summary_none");

    return (
      <div>
        {/* Price display */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-text-secondary mb-4">
            {t("result_title")}
          </h2>
          <div className="flex items-baseline justify-center gap-2 flex-wrap">
            <span className="text-3xl md:text-4xl font-extrabold text-primary" dir="ltr">
              ${displayLow.toLocaleString()}
            </span>
            <span className="text-text-secondary text-lg">
              {t("result_to")}
            </span>
            <span className="text-3xl md:text-4xl font-extrabold text-primary" dir="ltr">
              ${displayHigh.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-surface rounded-xl p-6 mb-6">
          <h3 className="font-bold text-text-primary mb-4">
            {t("summary_title")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-text-secondary">
                {t("summary_project")}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {getProjectName(projectType)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-text-secondary">
                {t("summary_property")}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {getPropertyName(propertyType)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-text-secondary">
                {t("summary_area")}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {area} {t("area_unit")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-text-secondary">
                {t("summary_quality")}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {getQualityName(qualityLevel)}
              </span>
            </div>
            <div className="flex justify-between items-start py-2">
              <span className="text-sm text-text-secondary">
                {t("summary_options")}
              </span>
              <span className="text-sm font-semibold text-text-primary text-end max-w-[60%]">
                {optionsText}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-text-secondary text-center mb-8 leading-relaxed">
          {t("result_disclaimer")}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t("whatsapp_cta")}
          </a>
          <Link
            href="/booking"
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
          >
            {t("booking_cta")}
          </Link>
        </div>

        {/* Recalculate */}
        <button
          type="button"
          onClick={resetCalculator}
          className="w-full text-center text-sm text-text-secondary hover:text-primary transition-colors py-2 font-medium"
        >
          {t("recalculate")}
        </button>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case "result":
        return renderResult();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 max-w-3xl mx-auto">
      {/* Progress indicator */}
      {renderProgress()}

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      {step !== "result" && (
        <div className="flex items-center justify-between mt-8">
          {/* Back button */}
          {step !== 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="border border-gray-200 text-text-secondary py-3 px-8 rounded-xl hover:bg-surface transition-colors font-medium"
            >
              {t("back")}
            </button>
          ) : (
            <div />
          )}

          {/* Next / Calculate button */}
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed()}
            className={cn(
              "bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-xl transition-colors",
              !canProceed() && "opacity-50 cursor-not-allowed"
            )}
          >
            {step === 5 ? t("calculate") : t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
