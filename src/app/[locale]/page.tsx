import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import FamilyTreePage from '@/components/app/FamilyTreePage';
 
type Props = {
  params: {locale: string};
};

export default function Home({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('Home');

  return <FamilyTreePage />;
}
