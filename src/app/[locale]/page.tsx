import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreeServer from '@/components/app/FamilyTreeServer';

type Props = {
  params: {locale: string};
};

export default async function Home({ params }: Props) {
  // Wait for the locale to be resolved.
  const locale = await params.locale;
  unstable_setRequestLocale(locale);

  return <FamilyTreeServer />;
}
