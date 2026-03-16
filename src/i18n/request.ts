import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import ar from '@/messages/ar.json';
import en from '@/messages/en.json';

const messagesMap: Record<string, typeof ar> = { ar, en };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'ar' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messagesMap[locale] ?? ar,
  };
});
