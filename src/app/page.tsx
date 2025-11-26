import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreeServer from "@/components/app/FamilyTreeServer";

export default async function Home({ params }: any) {
  const locale = params?.locale ?? (await params)?.locale;
  unstable_setRequestLocale(locale);
  return <FamilyTreeServer />;
}