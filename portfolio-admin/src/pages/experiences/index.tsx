import Head from 'next/head';
import Layout from '@/components/layouts/Layout';
import { FiBriefcase, FiMapPin, FiCalendar, FiLink, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';
import useAnalytics from '@/utils/hooks/useAnalytics';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  companyUrl?: string;
}

interface ExperiencesPageProps {
  experiences: Experience[];
}

export default function ExperiencesPage({ experiences }: ExperiencesPageProps) {
  useAnalytics({
    enabled: true,
    updateInterval: 30000,
    trackTimeSpent: true
  });

  const { theme } = useTheme();

  return (
    <Layout>
      <Head>
        <title>Mes Expériences - Portfolio</title>
        <meta name="description" content="Mon parcours professionnel et mes missions" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">Mes Expériences</h1>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-8">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                   {/* Connector Line for Timeline Effect (Optional) */}
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-60"></div>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {experience.title}
                      </h2>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-lg">
                        <FiBriefcase className="w-5 h-5 mr-2" />
                        {experience.company}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {new Date(experience.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          {' - '}
                          {experience.endDate 
                            ? new Date(experience.endDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                            : <span className="text-green-600 dark:text-green-400">Aujourd'hui</span>
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        {experience.location}
                      </div>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-6 text-gray-600 dark:text-gray-300">
                    <p>{experience.description}</p>
                  </div>

                  {experience.companyUrl && (
                    <div className="flex justify-end">
                      <a
                        href={experience.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <FiLink className="w-4 h-4 mr-1" />
                        Visiter le site de l'entreprise
                      </a>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    await connectDB();
    const experiences = await Experience.find({})
      .sort({ startDate: -1, order: -1 })
      .lean();

    return {
      props: {
        experiences: JSON.parse(JSON.stringify(experiences))
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des expériences:', error);
    return {
      props: {
        experiences: []
      },
      revalidate: 60
    };
  }
};