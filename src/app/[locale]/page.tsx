import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreeServer from '@/components/app/FamilyTreeServer';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);

  return <FamilyTreeServer />;
}
