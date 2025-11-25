import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreePage from '@/components/app/FamilyTreePage';

type Props = {
  params: {locale: string};
};

export default function Home({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);

  return <FamilyTreePage />;
}