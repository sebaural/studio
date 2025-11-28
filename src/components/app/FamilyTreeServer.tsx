import 'server-only';
import fs from 'fs';
import path from 'path';
import FamilyTreePage from "@/components/app/FamilyTreePage";
import type { FamilyMember } from "@/lib/types";

// This is a server component that will re-read the file on every request in dev mode.
// In production, this will be run at build time.
export default async function FamilyTreeServer() {
  const dataPath = path.join(process.cwd(), 'src', 'lib', 'initial-data.ts');
  
  // This is a trick to bypass Next.js's caching of imports.
  // By reading the file and using a dynamic function constructor,
  // we ensure we always get the latest version of the data.
  const fileContent = await fs.promises.readFile(dataPath, 'utf-8');
  // Remove the import statement before evaluating
  const cleanedContent = fileContent.replace(/import.*?;/g, '');
  const members: FamilyMember[] = new Function(`${cleanedContent.replace('export const initialMembers: FamilyMember[] =', 'return ')}`)();

  return <FamilyTreePage initialMembers={members} />;
}
