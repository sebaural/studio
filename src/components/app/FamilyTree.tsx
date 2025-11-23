'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FamilyMember } from '@/lib/types';
import FamilyMemberCard from './FamilyMemberCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users } from 'lucide-react';

type FamilyTreeProps = {
  members: FamilyMember[];
  onEditMember: (member: FamilyMember) => void;
};

type FamilyNodeProps = {
  memberId: string;
  allMembers: Map<string, FamilyMember>;
  onEditMember: (member: FamilyMember) => void;
  level: number;
};

const FamilyNode: React.FC<FamilyNodeProps> = ({ memberId, allMembers, onEditMember, level }) => {
  const member = allMembers.get(memberId);
  if (!member) return null;

  const spouse = member.spouse ? allMembers.get(member.spouse) : null;
  const children = member.children.filter(childId => allMembers.has(childId));

  const nodeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: level * 0.1,
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={nodeVariants}
      className="flex flex-col items-center relative"
    >
      {/* Couple */}
      <div className="flex items-start gap-4 relative">
        <FamilyMemberCard member={member} onEdit={onEditMember} />
        {spouse && (
          <>
            <div className="absolute top-1/2 left-full w-4 h-0.5 bg-border -translate-y-1/2" />
            <div className="absolute top-1/2 right-full w-4 h-0.5 bg-border -translate-y-1/2" />
            <FamilyMemberCard member={spouse} onEdit={onEditMember} />
          </>
        )}
      </div>

      {/* Connector to children */}
      {children.length > 0 && (
        <div className="mt-6 relative w-full flex justify-center connector-down">
          {/* Children */}
          <div className="flex justify-center gap-8 pt-6 mt-6 relative connector-across">
            {children.map((childId) => (
              <div key={childId} className="flex flex-col items-center relative connector-up">
                <FamilyNode
                  memberId={childId}
                  allMembers={allMembers}
                  onEditMember={onEditMember}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};


const FamilyTree: React.FC<FamilyTreeProps> = ({ members, onEditMember }) => {
  if (!members || members.length === 0) {
    return (
        <Card className='text-center w-full max-w-md mx-auto'>
            <CardHeader>
                <CardTitle className='flex items-center justify-center gap-2 font-headline'><Users /> No Family Members</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Your family tree is empty. Start by adding a family member.</p>
            </CardContent>
        </Card>
    );
  }

  const membersMap = new Map(members.map((m) => [m.id, m]));
  
  const childIds = new Set<string>();
  members.forEach(m => {
    m.children.forEach(c => childIds.add(c));
    m.parents.forEach(p => {
        const parent = membersMap.get(p);
        if(parent && !parent.children.includes(m.id)) {
            // This is a data consistency fix
            parent.children.push(m.id);
        }
    })
  });

  const rootNodes = members.filter(m => !m.parents || m.parents.length === 0 || m.parents.every(pId => !membersMap.has(pId)));

  return (
    <div className="w-full h-full overflow-x-auto py-10">
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-12">
           <AnimatePresence>
            {rootNodes.map((root) => (
              <motion.div key={root.id} initial="hidden" animate="visible" exit="hidden">
                <FamilyNode
                  memberId={root.id}
                  allMembers={membersMap}
                  onEditMember={onEditMember}
                  level={0}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
