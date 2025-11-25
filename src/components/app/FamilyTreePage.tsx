'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { FamilyMember } from '@/lib/types';
import Header from '@/components/app/Header';
import FamilyTree from '@/components/app/FamilyTree';
import AddFamilyMemberDialog from '@/components/app/AddFamilyMemberDialog';
import { initialMembers as staticInitialMembers } from '@/lib/initial-data';
import { saveFamilyMembers } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function FamilyTreePage() {
  const t = useTranslations('FamilyMembers');
  const locale = useLocale();

  const getTranslatedMembers = () => {
    return staticInitialMembers.map(member => ({
      ...member,
      name: t(member.id + '.name' as any),
      birthplace: t(member.id + '.birthplace' as any),
      bio: t(member.id + '.bio' as any),
    }));
  };
  
  const [members, setMembers] = useState<FamilyMember[]>(getTranslatedMembers());
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);
  const [isSaving, startSaving] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setMembers(getTranslatedMembers());
  }, [locale]);

  const handleSaveMember = (memberToSave: FamilyMember) => {
    let newMembers: FamilyMember[];

    setMembers((prevMembers) => {
      const updatedMembers = [...prevMembers];
      const existingMemberIndex = updatedMembers.findIndex((m) => m.id === memberToSave.id);
  
        const oldMember =
          existingMemberIndex > -1
            ? updatedMembers[existingMemberIndex]
            : undefined;
  
        if (existingMemberIndex > -1) {
          // Update existing member
          updatedMembers[existingMemberIndex] = memberToSave;
        } else {
          // Add new member
          updatedMembers.push(memberToSave);
        }
  
        // --- Handle relationship updates ---
  
        // 1. Spouse relationship
        const oldSpouseId = oldMember?.spouse;
        const newSpouseId = memberToSave.spouse;
  
        // Clear old spouse's spouse field if it's changed
        if (oldSpouseId && oldSpouseId !== newSpouseId) {
          const oldSpouseIndex = updatedMembers.findIndex((m) => m.id === oldSpouseId);
          if (oldSpouseIndex > -1) {
            updatedMembers[oldSpouseIndex] = {
              ...updatedMembers[oldSpouseIndex],
              spouse: undefined,
            };
          }
        }
  
        // Set new spouse's spouse field
        if (newSpouseId) {
          const newSpouseIndex = updatedMembers.findIndex((m) => m.id === newSpouseId);
          if (newSpouseIndex > -1) {
            // Unset the new spouse's current partner if they have one
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
  
        // 2. Parent-child relationship
        const oldParents = oldMember?.parents || [];
        const newParents = memberToSave.parents || [];
  
        const addedParents = newParents.filter((pId) => !oldParents.includes(pId));
        const removedParents = oldParents.filter((pId) => !newParents.includes(pId));
  
        // Add child to new parents
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
  
        // Remove child from old parents
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
  
        newMembers = updatedMembers;
        return newMembers;
      });

      startSaving(async () => {
        // We need to save the non-translated version. We can find the original from staticInitialMembers
        const membersToSave = newMembers.map(m => {
            const staticMember = staticInitialMembers.find(sm => sm.id === m.id);
            if (staticMember) {
                return {
                    ...staticMember,
                    parents: m.parents,
                    spouse: m.spouse,
                    children: m.children
                }
            }
            // This is a new member, so we need to "un-translate" it. 
            // This is a hacky workaround for this prototype. In a real app,
            // the form would submit the non-translated version.
            return {
                ...m,
                name: `__NEEDS_TRANSLATION__${m.name}`,
                birthplace: `__NEEDS_TRANSLATION__${m.birthplace}`,
                bio: `__NEEDS_TRANSLATION__${m.bio}`,
            };
        });

        const result = await saveFamilyMembers(membersToSave);
        if (result.success) {
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
