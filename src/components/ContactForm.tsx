"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { submitContact } from "@/lib/api";
import { trackGA4Event, trackFBEvent } from "@/lib/analytics";

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  message?: string;
}

export default function ContactForm() {
  const t = useTranslations("form");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("name_required");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("message_required");
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
      const result = await submitContact(formData);

      if (result.success) {
        trackGA4Event("contact_submit");
        trackFBEvent("Contact");
        setSuccess(true);
        setFormData({ name: "", phone: "", email: "", message: "" });
        setErrors({});
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm font-medium">
          {t("success")}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
          {t("error")}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="font-medium text-text-primary mb-2 block">
          {t("name")} <span className="text-red-500">{t("required")}</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          placeholder={t("name_placeholder")}
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="font-medium text-text-primary mb-2 block">
          {t("phone")}
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          placeholder={t("phone_placeholder")}
          dir="ltr"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="font-medium text-text-primary mb-2 block">
          {t("email")}
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          placeholder={t("email_placeholder")}
          dir="ltr"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="font-medium text-text-primary mb-2 block">
          {t("message")} <span className="text-red-500">{t("required")}</span>
        </label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={(e) => {
            setFormData({ ...formData, message: e.target.value });
            if (errors.message) setErrors({ ...errors, message: undefined });
          }}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none"
          placeholder={t("message_placeholder")}
        />
        {errors.message && (
          <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>
        )}
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
