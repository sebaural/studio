'use client';

import { useState } from 'react';
import type { FamilyMember } from '@/lib/types';
import Header from '@/components/app/Header';
import FamilyTree from '@/components/app/FamilyTree';
import AddFamilyMemberDialog from '@/components/app/AddFamilyMemberDialog';

const initialMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Semyon Slizh',
    birthDate: '1908-10-24',
    deathDate: '1995-10-20',
    birthplace: 'Lesbon, Portugal',
    bio: 'A veteran of World War II, John was a carpenter by trade and a loving grandfather.',
    photoUrl: 'https://picsum.photos/seed/heritage1/400/400',
    photoHint: 'man portrait',
    parents: [],
    spouse: '2',
    children: ['3'],
  },
  {
    id: '2',
    name: 'Mary Johnson',
    birthDate: '1922-08-30',
    deathDate: '2001-01-15',
    birthplace: 'Manchester, England',
    bio: 'Mary was a school teacher known for her kindness and delicious apple pies.',
    photoUrl: 'https://picsum.photos/seed/heritage2/400/400',
    photoHint: 'woman portrait',
    parents: [],
    spouse: '1',
    children: ['3'],
  },
  {
    id: '3',
    name: 'Robert Smith',
    birthDate: '1950-11-01',
    birthplace: 'London, England',
    bio: 'An architect who loved to sail. He designed several notable buildings in his city.',
    photoUrl: 'https://picsum.photos/seed/heritage3/400/400',
    photoHint: 'man 1950s',
    parents: ['1', '2'],
    spouse: '4',
    children: ['5'],
  },
  {
    id: '4',
    name: 'Jane Doe',
    birthDate: '1952-02-20',
    birthplace: 'New York, USA',
    bio: 'A journalist who traveled the world, Jane had a passion for storytelling and photography.',
    photoUrl: 'https://picsum.photos/seed/heritage4/400/400',
    photoHint: 'woman 1950s',
    parents: [],
    spouse: '3',
    children: ['5'],
  },
  {
    id: '5',
    name: 'Sarah Smith',
    birthDate: '1980-07-10',
    birthplace: 'New York, USA',
    bio: 'A software developer and amateur musician, Sarah carries on her family\'s legacy of creativity.',
    photoUrl: 'https://picsum.photos/seed/heritage6/400/400',
    photoHint: 'woman 1980s',
    parents: ['3', '4'],
    children: [],
  },
];

export default function Home() {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  const handleSaveMember = (memberToSave: FamilyMember) => {
    setMembers((prevMembers) => {
      let newMembers = [...prevMembers];
      const existingMemberIndex = newMembers.findIndex((m) => m.id === memberToSave.id);

      const oldMember = existingMemberIndex > -1 ? newMembers[existingMemberIndex] : undefined;

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
        const oldSpouseIndex = newMembers.findIndex(m => m.id === oldSpouseId);
        if (oldSpouseIndex > -1) {
          newMembers[oldSpouseIndex] = { ...newMembers[oldSpouseIndex], spouse: undefined };
        }
      }
      
      // Set new spouse's spouse field
      if (newSpouseId) {
        const newSpouseIndex = newMembers.findIndex(m => m.id === newSpouseId);
        if (newSpouseIndex > -1) {
          // Unset the new spouse's current partner if they have one
           const newSpousesCurrentPartnerId = newMembers[newSpouseIndex].spouse;
           if (newSpousesCurrentPartnerId && newSpousesCurrentPartnerId !== memberToSave.id) {
                const partnerIndex = newMembers.findIndex(m => m.id === newSpousesCurrentPartnerId);
                if (partnerIndex > -1) {
                    newMembers[partnerIndex] = { ...newMembers[partnerIndex], spouse: undefined };
                }
           }
          newMembers[newSpouseIndex] = { ...newMembers[newSpouseIndex], spouse: memberToSave.id };
        }
      }

      // 2. Parent-child relationship
      const oldParents = oldMember?.parents || [];
      const newParents = memberToSave.parents || [];
      
      const addedParents = newParents.filter(pId => !oldParents.includes(pId));
      const removedParents = oldParents.filter(pId => !newParents.includes(pId));

      // Add child to new parents
      addedParents.forEach(pId => {
        const parentIndex = newMembers.findIndex(m => m.id === pId);
        if (parentIndex > -1 && !newMembers[parentIndex].children.includes(memberToSave.id)) {
          newMembers[parentIndex] = { ...newMembers[parentIndex], children: [...newMembers[parentIndex].children, memberToSave.id]};
        }
      });
      
      // Remove child from old parents
      removedParents.forEach(pId => {
         const parentIndex = newMembers.findIndex(m => m.id === pId);
         if (parentIndex > -1) {
           newMembers[parentIndex] = { ...newMembers[parentIndex], children: newMembers[parentIndex].children.filter(cId => cId !== memberToSave.id) };
         }
      });

      return newMembers;
    });

    setAddMemberOpen(false);
    setEditingMember(undefined);
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
        onOpenChange={setAddMemberOpen}
        onSave={handleSaveMember}
        existingMember={editingMember}
        allMembers={members}
      />
    </div>
  );
}
