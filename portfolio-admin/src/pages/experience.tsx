import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/layout/Layout';
import ExperienceCard from '@/components/experience/ExperienceCard';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';

interface ExperiencePageProps {
  experiences: Array<{
    _id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
    technologies: string[];
    companyLogo?: string;
  }>;
}

export default function Experiences({ experiences }: ExperiencePageProps) {
  const { t } = useTranslation('experience');

  return (
    <Layout>
      <Head>
        <title>{t('title')} - Portfolio</title>
        <meta name="description" content={t('description')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('title')}
          </h1>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

              {/* Experience cards */}
              <div className="space-y-12">
                {experiences.map((experience) => (
                  <div
                    key={experience._id}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white dark:border-gray-900" />
                    
                    <div className="md:w-1/2 md:ml-auto pl-8 md:pl-12">
                      <ExperienceCard experience={experience} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    await connectDB();
    const experiences = await Experience.find({})
      .sort({ startDate: -1, order: -1 })
      .lean();

    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'fr', ['common', 'experience'])),
        experiences: JSON.parse(JSON.stringify(experiences)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'fr', ['common', 'experience'])),
        experiences: [],
      },
      revalidate: 60,
    };
  }
};
