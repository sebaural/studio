import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales in the app
const locales = ['en', 'ru'];

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` is a Promise that resolves to the matched locale segment
  const locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) notFound();

  // Load messages for the matched locale. Messages live at /messages/{locale}.json
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
