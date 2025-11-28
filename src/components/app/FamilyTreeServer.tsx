import 'server-only';
import FamilyTreePage from "@/components/app/FamilyTreePage";
import { initialMembers } from "@/lib/initial-data";

export default async function FamilyTreeServer() {
  // In dev mode, with revalidate = 0, this will be fresh on each request.
  // In prod, this will be loaded at build time.
  const members = initialMembers;

  return <FamilyTreePage initialMembers={members} />;
}
