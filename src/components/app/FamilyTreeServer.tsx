import React from "react";
import type { FamilyMember } from "@/lib/types";
import FamilyTreeClient from "./FamilyTreeClient";
import { initialMembers as staticInitialMembers } from "@/lib/initial-data";

// Server component: loads serializable data and renders client component
export default function FamilyTreeServer() {
  try {
    const initialMembers: FamilyMember[] = staticInitialMembers.map((m: FamilyMember) => ({ ...m }));
    return <FamilyTreeClient initialMembers={initialMembers} />;
  } catch (err) {
    // Provide clearer error during prerender to help debugging
    // eslint-disable-next-line no-console
    console.error("FamilyTreeServer prerender error:", err);
    throw err;
  }
}
