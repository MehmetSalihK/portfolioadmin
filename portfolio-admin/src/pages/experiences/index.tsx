import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layouts/Layout';
import { FiBriefcase, FiMapPin, FiCalendar, FiLink, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();

  return (
    <Layout>
      <Head>
        <title>Mes Expériences - Portfolio</title>
        <meta name="description" content="Liste de mes expériences professionnelles" />
      </Head>

      <main className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-8 text-center dark:text-white text-gray-900">
              Mes Expériences
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {experiences.map((experience) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-6 ${
                    theme === 'dark' 
                      ? 'bg-[#1E1E1E] hover:bg-[#252525]' 
                      : 'bg-white hover:bg-gray-50'
                  } shadow-lg transition-all duration-300 hover:shadow-xl`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold mb-2 dark:text-white text-gray-900">
                        {experience.title}
                      </h2>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <FiBriefcase className="w-4 h-4 mr-2" />
                        {experience.company}
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        {experience.location}
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        {new Date(experience.startDate).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric'
                        })}
                        {' - '}
                        {experience.endDate 
                          ? new Date(experience.endDate).toLocaleDateString('fr-FR', {
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'Présent'
                        }
                      </div>
                    </div>

                    <div className="flex-grow">
                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                        {experience.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FiClock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {experience.endDate ? 'Terminé' : 'Poste actuel'}
                          </span>
                        </div>
                        
                        {experience.companyUrl && (
                          <a
                            href={experience.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <FiLink className="w-4 h-4 mr-1" />
                            Site web
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Si vous êtes en local, utilisez l'URL absolue
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/experiences'
      : '/api/experiences';

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const experiences = await response.json();

    return {
      props: {
        experiences,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des expériences:', error);
    return {
      props: {
        experiences: [],
      },
      revalidate: 60,
    };
  }
}; 