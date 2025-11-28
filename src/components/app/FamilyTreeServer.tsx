import 'server-only';
import FamilyTreePage from "@/components/app/FamilyTreePage";
import { initialMembers } from "@/lib/initial-data";

export default async function FamilyTreeServer() {
  const members = initialMembers;

  return <FamilyTreePage initialMembers={members} />;
}
