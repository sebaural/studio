import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreeServer from '@/components/app/FamilyTreeServer';

type Props = {
  params: {locale: string};
};

// This forces the page to be dynamically rendered,
// ensuring the latest data from initial-data.ts is fetched on each request in development.
export const revalidate = 0;

export default function Home({ params }: Props) {
  unstable_setRequestLocale(params.locale);

  return <FamilyTreeServer />;
}
