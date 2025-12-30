import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import Education from '@/models/Education';
import { FiBookOpen, FiCalendar, FiMapPin, FiAward, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useAnalytics from '@/utils/hooks/useAnalytics';

interface FormationsPageProps {
  educations: {
    _id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description: string;
    location: string;
    isCurrentlyStudying: boolean;
    isPaused: boolean;
    isDiplomaPassed: boolean;
    diplomaFile?: string;
    isVisible: boolean;
  }[];
}

export default function FormationsPage({ educations = [] }: FormationsPageProps) {
  // Tracking analytics pour la page Formations
  useAnalytics({
    enabled: true,
    updateInterval: 30000, // 30 secondes
    trackTimeSpent: true
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  return (
    <Layout>
      <Head>
        <title>Mes Formations - Portfolio</title>
        <meta name="description" content="Découvrez mon parcours de formation et mes diplômes" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">Mes Formations</h1>
        
          <div className="container-fluid relative z-10">

            {educations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {educations.map((education) => (
                  <motion.div
                    key={education._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Header avec icône et statut */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                      <div className="flex items-start justify-between mb-2">
                        <FiBookOpen className="w-8 h-8" />
                        {education.isDiplomaPassed && (
                          <FiAward className="w-6 h-6 text-yellow-300" title="Diplôme obtenu" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{education.degree}</h3>
                      <p className="text-blue-100">{education.field}</p>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {education.school}
                      </h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiMapPin className="w-4 h-4" />
                          <span>{education.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiCalendar className="w-4 h-4" />
                          <span>
                            {formatDate(education.startDate)} - {' '}
                            {education.isCurrentlyStudying ? (
                              <span className="text-green-600 dark:text-green-400 font-medium">En cours</span>
                            ) : education.isPaused ? (
                              <span className="text-orange-600 dark:text-orange-400 font-medium">En pause</span>
                            ) : (
                              formatDate(education.endDate!)
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {education.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                          {education.description}
                        </p>
                      )}
                      
                      {education.diplomaFile && (
                        <div className="mt-4">
                          <a
                            href={education.diplomaFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            Voir le diplôme
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <FiBookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucune formation disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    await connectDB();
    const educations = await Education.find({ isVisible: true }).sort({ startDate: -1 }).lean();

    return {
      props: {
        educations: JSON.parse(JSON.stringify(educations)),
      },
      revalidate: 1,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        educations: [],
      },
      revalidate: 1,
    };
  }
};
