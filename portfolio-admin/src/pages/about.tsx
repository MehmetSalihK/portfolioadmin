import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import BiographySection from '@/components/about/BiographySection';
import useAnalytics from '@/utils/hooks/useAnalytics';

export default function About() {
  // Tracking analytics pour la page À propos
  useAnalytics({
    enabled: true,
    updateInterval: 30000, // 30 secondes
    trackTimeSpent: true
  });

  return (
    <Layout>
      <Head>
        <title>À Propos - Portfolio</title>
        <meta name="description" content="En savoir plus sur mon parcours, mes valeurs et mes objectifs professionnels" />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <BiographySection />
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {},
  };
};
