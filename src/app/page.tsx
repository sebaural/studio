'use client';

import { useState } from 'react';
import type { FamilyMember } from '@/lib/types';
import Header from '@/components/app/Header';
import FamilyTree from '@/components/app/FamilyTree';
import AddFamilyMemberDialog from '@/components/app/AddFamilyMemberDialog';
import { initialMembers } from '@/lib/initial-data';

export default function Home() {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  const handleSaveMember = (memberToSave: FamilyMember) => {
    setMembers((prevMembers) => {
      const newMembers = [...prevMembers];
      const existingMemberIndex = newMembers.findIndex((m) => m.id === memberToSave.id);
  
        const oldMember =
          existingMemberIndex > -1
            ? newMembers[existingMemberIndex]
            : undefined;
  
        if (existingMemberIndex > -1) {
          // Update existing member
          newMembers[existingMemberIndex] = memberToSave;
        } else {
          // Add new member
          newMembers.push(memberToSave);
        }
  
        // --- Handle relationship updates ---
  
        // 1. Spouse relationship
        const oldSpouseId = oldMember?.spouse;
        const newSpouseId = memberToSave.spouse;
  
        // Clear old spouse's spouse field if it's changed
        if (oldSpouseId && oldSpouseId !== newSpouseId) {
          const oldSpouseIndex = newMembers.findIndex((m) => m.id === oldSpouseId);
          if (oldSpouseIndex > -1) {
            newMembers[oldSpouseIndex] = {
              ...newMembers[oldSpouseIndex],
              spouse: undefined,
            };
          }
        }
  
        // Set new spouse's spouse field
        if (newSpouseId) {
          const newSpouseIndex = newMembers.findIndex((m) => m.id === newSpouseId);
          if (newSpouseIndex > -1) {
            // Unset the new spouse's current partner if they have one
            const newSpousesCurrentPartnerId = newMembers[newSpouseIndex].spouse;
            if (
              newSpousesCurrentPartnerId &&
              newSpousesCurrentPartnerId !== memberToSave.id
            ) {
              const partnerIndex = newMembers.findIndex(
                (m) => m.id === newSpousesCurrentPartnerId
              );
              if (partnerIndex > -1) {
                newMembers[partnerIndex] = {
                  ...newMembers[partnerIndex],
                  spouse: undefined,
                };
              }
            }
            newMembers[newSpouseIndex] = {
              ...newMembers[newSpouseIndex],
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
          const parentIndex = newMembers.findIndex((m) => m.id === pId);
          if (
            parentIndex > -1 &&
            !newMembers[parentIndex].children.includes(memberToSave.id)
          ) {
            newMembers[parentIndex] = {
              ...newMembers[parentIndex],
              children: [...newMembers[parentIndex].children, memberToSave.id],
            };
          }
        });
  
        // Remove child from old parents
        removedParents.forEach((pId) => {
          const parentIndex = newMembers.findIndex((m) => m.id === pId);
          if (parentIndex > -1) {
            newMembers[parentIndex] = {
              ...newMembers[parentIndex],
              children: newMembers[parentIndex].children.filter(
                (cId) => cId !== memberToSave.id
              ),
            };
          }
        });
  
        return newMembers;
      });

    setEditingMember(memberToSave);
    setAddMemberOpen(false);
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
      />
    </div>
  );
}
