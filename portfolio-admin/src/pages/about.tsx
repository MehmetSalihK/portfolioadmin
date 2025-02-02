import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/layout/Layout';
import BiographySection from '@/components/about/BiographySection';

export default function About() {
  const { t } = useTranslation('about');

  return (
    <Layout>
      <Head>
        <title>{t('title')} - Portfolio</title>
        <meta name="description" content="En savoir plus sur mon parcours, mes valeurs et mes objectifs professionnels" />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('title')}
          </h1>

          <BiographySection />
        </div>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'about'])),
    },
  };
};
