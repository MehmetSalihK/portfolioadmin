import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import BiographySection from '@/components/about/BiographySection';

export default function About() {
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
