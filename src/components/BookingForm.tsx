"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { submitBooking, type BookingData } from "@/lib/api";
import { generateICS, downloadICS } from "@/lib/ics";
import CalendarPicker from "@/components/CalendarPicker";

export default function BookingForm() {
  const t = useTranslations("booking");

  const [formData, setFormData] = useState<BookingData>({
    name: "",
    phone: "",
    email: "",
    projectType: "",
    location: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof BookingData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("name_required");
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t("phone_required");
    }
    if (!formData.projectType.trim()) {
      newErrors.projectType = t("project_type_required");
    }
    if (!formData.location.trim()) {
      newErrors.location = t("location_required");
    }
    if (!formData.preferredDate.trim()) {
      newErrors.preferredDate = t("preferred_date_required");
    }
    if (!formData.preferredTime.trim()) {
      newErrors.preferredTime = t("preferred_time_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(false);

    if (!validate()) return;

    setLoading(true);

    try {
      const result = await submitBooking(formData);

      if (result.success) {
        setSuccess(true);
        // Don't clear form yet — need data for .ics download
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadICS() {
    const ics = generateICS({
      title: t("calendar_event_title"),
      date: formData.preferredDate,
      time: formData.preferredTime,
      location: formData.location,
      description: t("calendar_event_description"),
    });
    downloadICS(ics, "manzel-consultation.ics");
  }

  const projectTypes = [
    { value: "interior_design", label: t("project_interior_design") },
    { value: "exterior_design", label: t("project_exterior_design") },
    { value: "full_execution", label: t("project_full_execution") },
    { value: "finishing", label: t("project_finishing") },
    { value: "plans", label: t("project_plans") },
  ];

  const timeSlots = [
    { value: "09:00", label: t("time_9") },
    { value: "10:00", label: t("time_10") },
    { value: "11:00", label: t("time_11") },
    { value: "12:00", label: t("time_12") },
    { value: "13:00", label: t("time_13") },
    { value: "14:00", label: t("time_14") },
    { value: "15:00", label: t("time_15") },
    { value: "16:00", label: t("time_16") },
    { value: "17:00", label: t("time_17") },
  ];

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition";

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center py-8"
      >
        {/* Green checkmark circle */}
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-success font-bold text-lg text-center">
          {t("success")}
        </p>

        {/* Download calendar button */}
        <button
          type="button"
          onClick={handleDownloadICS}
          className="mt-6 inline-flex items-center gap-2 border border-primary text-primary font-bold py-3 px-6 rounded-xl hover:bg-primary/5 transition-colors"
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          {t("download_calendar")}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
          {t("error")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="booking-name" className="font-medium text-text-primary mb-2 block">
            {t("name")} <span className="text-red-500">{t("required")}</span>
          </label>
          <input
            type="text"
            id="booking-name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={inputClass}
            placeholder={t("name_placeholder")}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="booking-phone" className="font-medium text-text-primary mb-2 block">
            {t("phone")} <span className="text-red-500">{t("required")}</span>
          </label>
          <input
            type="tel"
            id="booking-phone"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            className={inputClass}
            placeholder={t("phone_placeholder")}
            dir="ltr"
          />
          {errors.phone && (
            <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="booking-email" className="font-medium text-text-primary mb-2 block">
            {t("email")} <span className="text-text-secondary text-sm">({t("email_optional")})</span>
          </label>
          <input
            type="email"
            id="booking-email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
            placeholder={t("email_placeholder")}
            dir="ltr"
          />
        </div>

        {/* Project Type */}
        <div>
          <label htmlFor="booking-project-type" className="font-medium text-text-primary mb-2 block">
            {t("project_type")} <span className="text-red-500">{t("required")}</span>
          </label>
          <select
            id="booking-project-type"
            value={formData.projectType}
            onChange={(e) => {
              setFormData({ ...formData, projectType: e.target.value });
              if (errors.projectType) setErrors({ ...errors, projectType: undefined });
            }}
            className={inputClass}
          >
            <option value="">{t("project_type_placeholder")}</option>
            {projectTypes.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
          {errors.projectType && (
            <p className="mt-1.5 text-sm text-red-500">{errors.projectType}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="booking-location" className="font-medium text-text-primary mb-2 block">
            {t("location")} <span className="text-red-500">{t("required")}</span>
          </label>
          <input
            type="text"
            id="booking-location"
            value={formData.location}
            onChange={(e) => {
              setFormData({ ...formData, location: e.target.value });
              if (errors.location) setErrors({ ...errors, location: undefined });
            }}
            className={inputClass}
            placeholder={t("location_placeholder")}
          />
          {errors.location && (
            <p className="mt-1.5 text-sm text-red-500">{errors.location}</p>
          )}
        </div>

        {/* Preferred Time */}
        <div>
          <label htmlFor="booking-time" className="font-medium text-text-primary mb-2 block">
            {t("preferred_time")} <span className="text-red-500">{t("required")}</span>
          </label>
          <select
            id="booking-time"
            value={formData.preferredTime}
            onChange={(e) => {
              setFormData({ ...formData, preferredTime: e.target.value });
              if (errors.preferredTime) setErrors({ ...errors, preferredTime: undefined });
            }}
            className={inputClass}
          >
            <option value="">{t("preferred_time_placeholder")}</option>
            {timeSlots.map((ts) => (
              <option key={ts.value} value={ts.value}>
                {ts.label}
              </option>
            ))}
          </select>
          {errors.preferredTime && (
            <p className="mt-1.5 text-sm text-red-500">{errors.preferredTime}</p>
          )}
        </div>
      </div>

      {/* Preferred Date — full width */}
      <div>
        <label className="font-medium text-text-primary mb-2 block">
          {t("preferred_date")} <span className="text-red-500">{t("required")}</span>
        </label>
        <CalendarPicker
          value={formData.preferredDate || null}
          onChange={(date) => {
            setFormData({ ...formData, preferredDate: date });
            if (errors.preferredDate) setErrors({ ...errors, preferredDate: undefined });
          }}
          disableFridays={true}
        />
        <p className="mt-1.5 text-sm text-text-secondary">{t("friday_note")}</p>
        {errors.preferredDate && (
          <p className="mt-1.5 text-sm text-red-500">{errors.preferredDate}</p>
        )}
      </div>

      {/* Notes — full width */}
      <div>
        <label htmlFor="booking-notes" className="font-medium text-text-primary mb-2 block">
          {t("notes")}
        </label>
        <textarea
          id="booking-notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder={t("notes_placeholder")}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-xl w-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </button>
    </form>
  );
}
