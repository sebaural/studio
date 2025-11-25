'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Loader2, AlertTriangle, HelpCircle, Landmark, BookOpen } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { FamilyMember, HistoricalInsight } from '@/lib/types';
import { getHistoricalContext } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type HistoricalInsightDialogProps = {
  member: FamilyMember;
};

export default function HistoricalInsightDialog({ member }: HistoricalInsightDialogProps) {
  const t = useTranslations('HistoricalInsightDialog');
  const locale = useLocale();
  const [isOpen, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [insight, setInsight] = useState<HistoricalInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      // Reset state when dialog is opened
      setInsight(null);
      setError(null);
    }
  };

  const handleGenerate = () => {
    startTransition(async () => {
      setError(null);
      setInsight(null);
      const result = await getHistoricalContext({
        name: member.name,
        birthDate: member.birthDate,
        birthplace: member.birthplace,
        biography: member.bio,
        locale: locale,
      });

      if (result.success) {
        setInsight(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          {t('buttonText')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] flex flex-col bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            {t('title', { name: member.name })}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className='flex-grow overflow-y-auto -mr-6 pr-6'>
          <div className="space-y-4 py-4">
          {!insight && !isPending && !error && (
              <div className="text-center p-8 flex flex-col items-center gap-4">
                  <p className="text-muted-foreground">{t('initialPrompt', { name: member.name })}</p>
              </div>
          )}
          
          {isPending && (
              <div className="flex items-center justify-center p-8 gap-3 text-lg">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className='font-headline'>{t('generating')}</span>
              </div>
          )}

          {error && (
              <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {insight && (
              <div className="space-y-6">
              <div className="p-4 rounded-lg border bg-background/50">
                  <h3 className="font-headline text-lg flex items-center gap-2"><HelpCircle className='text-accent'/> {t('nameMeaning')}</h3>
                  <p className="text-muted-foreground mt-1">{insight.nameMeaning}</p>
              </div>
              <div className="p-4 rounded-lg border bg-background/50">
                  <h3 className="font-headline text-lg flex items-center gap-2"><Landmark className='text-accent'/> {t('birthplaceInfo')}</h3>
                  <p className="text-muted-foreground mt-1">{insight.birthplaceInformation}</p>
              </div>
              <div className="p-4 rounded-lg border bg-background/50">
                  <h3 className="font-headline text-lg flex items-center gap-2"><BookOpen className='text-accent'/> {t('historicalEvents')}</h3>
                  <p className="text-muted-foreground mt-1">{insight.historicalEvents}</p>
              </div>
              {insight.additionalInsights && (
                  <div className="p-4 rounded-lg border bg-background/50">
                  <h3 className="font-headline text-lg flex items-center gap-2"><Sparkles className='text-accent'/> {t('additionalInsights')}</h3>
                  <p className="text-muted-foreground mt-1">{insight.additionalInsights}</p>
                  </div>
              )}
              </div>
          )}
          </div>
        </div>

        <DialogFooter className='pt-4 border-t mt-auto'>
          <Button onClick={handleGenerate} disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('generatingButton')}
              </>
            ) : insight ? (
              t('regenerateButton')
            ) : (
              t('generateButton')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
