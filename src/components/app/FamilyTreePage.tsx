
'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { FamilyMember } from '@/lib/types';
import Header from '@/components/app/Header';
import FamilyTree from '@/components/app/FamilyTree';
import AddFamilyMemberDialog from '@/components/app/AddFamilyMemberDialog';
import { saveFamilyMembers } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

// Dynamically require `initial-data` to bypass Next.js module cache in dev mode.
// This ensures that the latest data is loaded from the file on each render.
const { initialMembers: staticInitialMembers } = require('@/lib/initial-data');
// Also dynamically load the English messages to get original, untranslated names.
const enMessages = require('../../../messages/en.json');

export default function FamilyTreePage() {
  const t = useTranslations('FamilyMembers');

  const getTranslatedMembers = () => {
    return staticInitialMembers.map((member: FamilyMember) => {
      // Use the translation if it exists, otherwise use the member's default name.
      const translatedName = t(`${member.id}.name`);
      const hasTranslation = translatedName !== `${member.id}.name` && translatedName !== '';

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
  };

  const [members, setMembers] = useState<FamilyMember[]>(getTranslatedMembers());
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);
  const [isSaving, startSaving] = useTransition();
  const { toast } = useToast();
  
  const handleSaveMember = (memberToSave: FamilyMember) => {
    startSaving(async () => {
      // Create the next state of members based on the saved member
      const newMembers = ((prevMembers) => {
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
    
          return updatedMembers;
      })(members);

      // This is the data that will be written to the file.
      // It must be stripped of any translations to keep the data file clean.
      const membersToSave = newMembers.map(member => {
        // Find original English data from the messages file, if it exists.
        const originalData = enMessages.FamilyMembers[member.id];
        const newMember = {...member};

        if (originalData) {
            newMember.name = originalData.name;
            newMember.birthplace = originalData.birthplace;
            newMember.bio = originalData.bio;
        }

        // If the user has edited the fields, use the edited values.
        if (member.name !== t(`${member.id}.name`)) {
            newMember.name = member.name;
        }
        if (member.birthplace !== t(`${member.id}.birthplace`)) {
            newMember.birthplace = member.birthplace;
        }
        if (member.bio !== t(`${member.id}.bio`)) {
            newMember.bio = member.bio;
        }
        
        return newMember;
      });
      
      const result = await saveFamilyMembers(membersToSave);
      if (result.success) {
        setMembers(newMembers); // Update UI state after successful save
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
