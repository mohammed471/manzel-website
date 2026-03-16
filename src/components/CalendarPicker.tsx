"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface CalendarPickerProps {
  value: string | null;
  onChange: (date: string) => void;
  disableFridays?: boolean;
  label?: string;
  error?: string;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check < today;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPicker({
  value,
  onChange,
  disableFridays = true,
  label,
  error,
}: CalendarPickerProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  const initialMonth = value
    ? new Date(value + "T00:00:00")
    : new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  // Week starts Saturday (6) for Arabic, Sunday (0) for English
  const weekStartDay = isArabic ? 6 : 0;

  // Generate weekday headers
  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (weekStartDay + i) % 7;
    // Use a known date to get the weekday name
    // Jan 4, 2026 is a Sunday (0)
    const refDate = new Date(2026, 0, 4 + dayIndex);
    const name = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(refDate);
    weekdays.push(name);
  }

  // Calculate the offset for the first day of the month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const offset = (firstDayOfMonth - weekStartDay + 7) % 7;

  // Month/year header
  const monthYearLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  // Can't navigate to past months
  const now = new Date();
  const canGoPrev =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth());

  function goToPrevMonth() {
    if (!canGoPrev) return;
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function isDisabled(date: Date): boolean {
    return isPast(date) || (disableFridays && isFriday(date));
  }

  function handleDayClick(day: number) {
    const date = new Date(year, month, day);
    if (isDisabled(date)) return;
    onChange(date.toISOString().split("T")[0]);
  }

  return (
    <div>
      {label && (
        <label className="font-medium text-text-primary mb-2 block">
          {label}
        </label>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              canGoPrev
                ? "hover:bg-surface text-text-primary"
                : "text-gray-300 cursor-not-allowed"
            )}
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="font-bold text-text-primary text-sm">
            {monthYearLabel}
          </span>

          <button
            type="button"
            onClick={goToNextMonth}
            className="w-8 h-8 rounded-lg hover:bg-surface flex items-center justify-center transition-colors text-text-primary"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdays.map((day, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center text-xs font-medium text-text-secondary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty offset cells */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const disabled = isDisabled(date);
            const today = isToday(date);
            const selected = selectedDate ? isSameDate(date, selectedDate) : false;

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={disabled}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors",
                  disabled && "text-gray-300 cursor-not-allowed",
                  !disabled && !selected && "hover:bg-primary/10 cursor-pointer text-text-primary",
                  today && !selected && "ring-2 ring-primary/30",
                  selected && "bg-primary text-white font-bold"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
