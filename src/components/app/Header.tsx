'use client';

import { Button } from '@/components/ui/button';
import { Leaf, Plus } from 'lucide-react';

type HeaderProps = {
  onAddMember: () => void;
};

export default function Header({ onAddMember }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold font-headline tracking-tight text-foreground">
            Heritage Hub
          </h1>
        </div>
        <Button onClick={onAddMember} className="gap-2">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add Member</span>
        </Button>
      </div>
    </header>
  );
}
