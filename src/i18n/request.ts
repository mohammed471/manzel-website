import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { getSiteMessages } from '@/lib/siteContent';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'ar' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Bundled translations + edits from the internal app («الموقع» → النصوص)
    messages: await getSiteMessages(locale),
  };
});
