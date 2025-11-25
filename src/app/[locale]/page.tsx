import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreePage from '@/components/app/FamilyTreePage';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);

  return <FamilyTreePage />;
}
