'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Leaf, Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

type HeaderProps = {
  onAddMember: () => void;
};

export default function Header({ onAddMember }: HeaderProps) {
  const t = useTranslations('Header');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold font-headline tracking-tight text-foreground">
            {t('title')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button onClick={onAddMember} className="gap-2">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t('addMember')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
