'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (nextLocale: string) => {
    // In next-intl, the default locale doesn't have a prefix.
    // The pathname for other locales is prefixed with `/<locale>`.
    // We need to handle both cases when creating the new path.
    const currentLocalePrefix = `/${locale}`;
    let newPath;

    if (pathname.startsWith(currentLocalePrefix)) {
      // The current path has a locale prefix, so we replace it
      newPath = pathname.replace(currentLocalePrefix, `/${nextLocale}`);
    } else {
      // The current path is for the default locale (no prefix), so we add one
      newPath = `/${nextLocale}${pathname}`;
    }

    router.replace(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('toggle', { locale: locale === 'en' ? 'ru' : 'en' })}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => switchLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLanguage('ru')}>
          Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
