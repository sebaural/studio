'use client';

import { useState, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { FamilyMember } from '@/lib/types';
import Header from '@/components/app/Header';
import FamilyTree from '@/components/app/FamilyTree';
import AddFamilyMemberDialog from '@/components/app/AddFamilyMemberDialog';
import { saveFamilyMembers } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import enMessages from '../../../messages/en.json';

type FamilyTreePageProps = {
  initialMembers: FamilyMember[];
};

export default function FamilyTreePage({ initialMembers }: FamilyTreePageProps) {
  const t = useTranslations('FamilyMembers');

  const translatedMembers = useMemo(() => {
    if (!Array.isArray(initialMembers)) {
        return [];
    }
    return initialMembers.map((member) => {
      const translatedName = t(`${member.id}.name`);
      const hasTranslation = translatedName && translatedName !== `${member.id}.name`;

      if (hasTranslation) {
        return {
          ...member,
          name: translatedName,
          birthplace: t(`${member.id}.birthplace`),
          bio: t(`${member.id}.bio`),
        };
      }
      return member;
    });
  }, [initialMembers, t]);

  const [members, setMembers] = useState<FamilyMember[]>(translatedMembers);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);
  const [isSaving, startSaving] = useTransition();
  const { toast } = useToast();
  
  const handleSaveMember = (memberToSave: FamilyMember) => {
    startSaving(async () => {
      const newMembers = ((prevMembers) => {
        const updatedMembers = [...prevMembers];
        const existingMemberIndex = updatedMembers.findIndex((m) => m.id === memberToSave.id);
    
          const oldMember =
            existingMemberIndex > -1
              ? updatedMembers[existingMemberIndex]
              : undefined;
    
          if (existingMemberIndex > -1) {
            updatedMembers[existingMemberIndex] = memberToSave;
          } else {
            updatedMembers.push(memberToSave);
          }
    
          const oldSpouseId = oldMember?.spouse;
          const newSpouseId = memberToSave.spouse;
    
          if (oldSpouseId && oldSpouseId !== newSpouseId) {
            const oldSpouseIndex = updatedMembers.findIndex((m) => m.id === oldSpouseId);
            if (oldSpouseIndex > -1) {
              updatedMembers[oldSpouseIndex] = {
                ...updatedMembers[oldSpouseIndex],
                spouse: undefined,
              };
            }
          }
    
          if (newSpouseId) {
            const newSpouseIndex = updatedMembers.findIndex((m) => m.id === newSpouseId);
            if (newSpouseIndex > -1) {
              const newSpousesCurrentPartnerId = updatedMembers[newSpouseIndex].spouse;
              if (
                newSpousesCurrentPartnerId &&
                newSpousesCurrentPartnerId !== memberToSave.id
              ) {
                const partnerIndex = updatedMembers.findIndex(
                  (m) => m.id === newSpousesCurrentPartnerId
                );
                if (partnerIndex > -1) {
                  updatedMembers[partnerIndex] = {
                    ...updatedMembers[partnerIndex],
                    spouse: undefined,
                  };
                }
              }
              updatedMembers[newSpouseIndex] = {
                ...updatedMembers[newSpouseIndex],
                spouse: memberToSave.id,
              };
            }
          }
    
          const oldParents = oldMember?.parents || [];
          const newParents = memberToSave.parents || [];
    
          const addedParents = newParents.filter((pId) => !oldParents.includes(pId));
          const removedParents = oldParents.filter((pId) => !newParents.includes(pId));
    
          addedParents.forEach((pId) => {
            const parentIndex = updatedMembers.findIndex((m) => m.id === pId);
            if (
              parentIndex > -1 &&
              !updatedMembers[parentIndex].children.includes(memberToSave.id)
            ) {
              updatedMembers[parentIndex] = {
                ...updatedMembers[parentIndex],
                children: [...updatedMembers[parentIndex].children, memberToSave.id],
              };
            }
          });
    
          removedParents.forEach((pId) => {
            const parentIndex = updatedMembers.findIndex((m) => m.id === pId);
            if (parentIndex > -1) {
              updatedMembers[parentIndex] = {
                ...updatedMembers[parentIndex],
                children: updatedMembers[parentIndex].children.filter(
                  (cId) => cId !== memberToSave.id
                ),
              };
            }
          });
    
          return updatedMembers;
      })(members);

      const membersToSave = newMembers.map(member => {
        const originalData = enMessages.FamilyMembers[member.id as keyof typeof enMessages.FamilyMembers];
        const newMember = {...member};
        
        if (originalData) {
            newMember.name = originalData.name;
            newMember.birthplace = originalData.birthplace;
            newMember.bio = originalData.bio;
        }

        return newMember;
      });
      
      const result = await saveFamilyMembers(membersToSave);
      if (result.success) {
        setMembers(newMembers); 
        setAddMemberOpen(false);
        setEditingMember(undefined);
      } else {
        toast({
          title: 'Error Saving Data',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };
  
  const handleAddMember = () => {
    setEditingMember(undefined);
    setAddMemberOpen(true);
  }

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setAddMemberOpen(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onAddMember={handleAddMember} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <FamilyTree members={members} onEditMember={handleEditMember} />
      </main>
      <AddFamilyMemberDialog
        isOpen={isAddMemberOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingMember(undefined);
          }
          setAddMemberOpen(isOpen);
        }}
        onSave={handleSaveMember}
        existingMember={editingMember}
        allMembers={members}
        isSaving={isSaving}
      />
    </div>
  );
}
