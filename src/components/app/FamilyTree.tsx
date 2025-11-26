'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
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
  primary: Set<string>;
};

const FamilyNode: React.FC<FamilyNodeProps> = ({ memberId, allMembers, onEditMember, level, primary }) => {
  const member = allMembers.get(memberId);
  if (!member) return null;

  // Only render this node if it's the primary location for this member
  if (!primary.has(member.id)) return null;

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
            {primary.has(spouse.id) && <FamilyMemberCard member={spouse} onEdit={onEditMember} />}
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
                  primary={primary}
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
  const t = useTranslations('FamilyTree');

  if (!members || members.length === 0) {
    return (
        <Card className='text-center w-full max-w-md mx-auto'>
            <CardHeader>
                <CardTitle className='flex items-center justify-center gap-2 font-headline'><Users /> {t('noMembersTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{t('noMembersDescription')}</p>
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
            {(() => {
              // Compute primary render locations deterministically (first-encounter DFS)
              // To avoid rendering multiple duplicate family sets, pick a single root
              // (deterministically the first root) and traverse from it only.
              const primary = new Set<string>();
              const dfs = (id: string) => {
                if (!id || primary.has(id) || !membersMap.has(id)) return;
                primary.add(id);
                const m = membersMap.get(id)!;
                if (m.spouse) dfs(m.spouse);
                m.children.forEach(dfs);
              };

              if (rootNodes.length > 0) {
                dfs(rootNodes[0].id);
              }

              const primaryRoots = rootNodes.length > 0 ? [rootNodes[0]] : [];

              return (
                <motion.div className="family-set">
                  {primaryRoots.map((root) => (
                    <motion.div key={root.id} initial="hidden" animate="visible" exit="hidden">
                      <FamilyNode
                        memberId={root.id}
                        allMembers={membersMap}
                        onEditMember={onEditMember}
                        level={0}
                        primary={primary}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
