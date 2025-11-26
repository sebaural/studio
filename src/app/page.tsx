import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreeClientWrapper from '@/components/app/FamilyTreeClientWrapper';

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function Home({ params }: Props) {
  const { locale } = (params as Promise<{ locale: string }>) instanceof Promise ? await params : (params as { locale: string });
  unstable_setRequestLocale(locale);
    return <FamilyTreeClientWrapper />;
}