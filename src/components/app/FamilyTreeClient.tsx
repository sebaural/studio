"use client"

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { FamilyMember } from "@/lib/types";
import FamilyMemberCard from "./FamilyMemberCard";
import AddFamilyMemberDialog from "./AddFamilyMemberDialog";
import HistoricalInsightDialog from "./HistoricalInsightDialog";
import { useToast } from "@/hooks/use-toast";

type Props = {
  initialMembers: FamilyMember[];
};

export default function FamilyTreeClient({ initialMembers }: Props) {
  const t = useTranslations();
  const { toast } = useToast();

  const [members, setMembers] = useState<FamilyMember[]>(() =>
    initialMembers.map((m) => ({ ...m }))
  );

  // keep deterministic primary set computation in client as well
  const primary = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    for (const m of members) map.set(m.id, m);

    const roots: FamilyMember[] = members.filter((m) => !(m.parents && m.parents.length > 0));
    const visited = new Set<string>();

    function dfs(id?: string) {
      if (!id) return;
      if (visited.has(id)) return;
      visited.add(id);
      const node = map.get(id);
      if (!node) return;
      for (const child of members.filter((mm) => (mm.parents || []).includes(node.id))) {
        dfs(child.id);
      }
    }

    for (const r of roots) dfs(r.id);
    return visited;
  }, [members]);

  useEffect(() => {
    // placeholder for any client-only effects (e.g., analytics)
  }, []);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  function handleAdd(newMember: FamilyMember) {
    setMembers((prev) => [...prev, newMember]);
    toast({ title: t("family.added"), description: newMember.name });
  }

  function handleEdit(member: FamilyMember) {
    setEditingMember(member);
    setDialogOpen(true);
  }

  async function handleSave(member: FamilyMember) {
    setIsSaving(true);
    try {
      setMembers((prev) => {
        const exists = prev.find((p) => p.id === member.id);
        if (exists) return prev.map((p) => (p.id === member.id ? member : p));
        return [...prev, member];
      });
      setEditingMember(undefined);
      setDialogOpen(false);
      toast({ title: t("family.saved"), description: member.name });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="family-set">
        {members
          .filter((m) => primary.has(m.id))
          .map((m) => (
            <FamilyMemberCard key={m.id} member={m} onEdit={handleEdit} />
          ))}
      </div>

      <AddFamilyMemberDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        existingMember={editingMember}
        allMembers={members}
        isSaving={isSaving}
      />
    </div>
  );
}
