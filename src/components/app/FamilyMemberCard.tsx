'use client';

import Image from 'next/image';
import { Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FamilyMember } from '@/lib/types';
import HistoricalInsightDialog from './HistoricalInsightDialog';

type FamilyMemberCardProps = {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
};

export default function FamilyMemberCard({ member, onEdit }: FamilyMemberCardProps) {
  const birthYear = member.birthDate ? format(parseISO(member.birthDate), 'yyyy') : '?';
  const deathYear = member.deathDate ? format(parseISO(member.deathDate), 'yyyy') : 'Present';

  return (
    <Card className="w-48 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm relative group">
      <CardHeader className="p-4">
        <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-accent/50">
          <Image
            src={member.photoUrl}
            alt={`Portrait of ${member.name}`}
            fill
            sizes="96px"
            className="object-cover"
            data-ai-hint={member.photoHint}
          />
        </div>
        <CardTitle className="mt-2 text-base font-headline">{member.name}</CardTitle>
        <CardDescription className="text-xs">
          {birthYear} - {deathYear}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col items-center justify-center gap-2">
         <HistoricalInsightDialog member={member} />
         <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onEdit(member)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit {member.name}</span>
         </Button>
      </CardContent>
    </Card>
  );
}
