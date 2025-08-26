import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import ExperienceCard from '@/components/experience/ExperienceCard';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';
import useAnalytics from '@/utils/hooks/useAnalytics';

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

export default function Experiences({ experiences = [] }: ExperiencePageProps) {
  // Tracking analytics pour la page Expériences
  useAnalytics({
    enabled: true,
    updateInterval: 30000, // 30 secondes
    trackTimeSpent: true
  });

  return (
    <Layout>
      <Head>
        <title>Expériences - Portfolio</title>
        <meta name="description" content="Découvrez mon parcours professionnel et mes expériences" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Mes Expériences
          </h1>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

              {/* Experience cards */}
              <div className="space-y-12">
                {experiences && experiences.length > 0 ? experiences.map((experience) => (
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
                )) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">Aucune expérience disponible pour le moment.</p>
                  </div>
                )}
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
        experiences: JSON.parse(JSON.stringify(experiences)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return {
      props: {
        experiences: [],
      },
      revalidate: 60,
    };
  }
};
