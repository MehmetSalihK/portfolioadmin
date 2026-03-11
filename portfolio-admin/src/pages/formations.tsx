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
  useAnalytics({
    enabled: true,
    updateInterval: 30000,
    trackTimeSpent: true
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  };

  return (
    <Layout>
      <Head>
        <title>Portfolio - Mes Formations</title>
        <meta name="description" content="Découvrez mon parcours académique et mes diplômes." />
      </Head>

      <main className="relative min-h-screen dark:bg-[#09090f] bg-white pt-32 pb-24 overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] dark:bg-indigo-600/5 bg-indigo-50/40 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] dark:bg-violet-600/5 bg-violet-50/30 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-16"
          >
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em] mb-3">
              <span className="w-8 h-[1px] bg-indigo-500" />
              Académique
            </div>
            <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">
              Mes Formations
            </h1>
            <p className="dark:text-zinc-400 text-zinc-600 text-lg font-medium max-w-xl">
              Les fondations de mes connaissances et mes certifications académiques.
            </p>
          </motion.div>

          {/* Timeline style grid */}
          {educations.length > 0 ? (
            <div className="relative">
              {/* Vertical line - hidden on very small mobile */}
              <div className="absolute left-4 md:left-[31px] top-6 bottom-6 w-px dark:bg-indigo-500/20 bg-indigo-200 hidden sm:block" />

              <div className="space-y-10">
                {educations.map((education, index) => (
                  <motion.div
                    key={education._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative pl-0 sm:pl-16"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[24.5px] top-7 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 dark:border-[#09090f] border-white shadow-md shadow-indigo-500/40 hidden sm:block z-10" />
                    
                    <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl p-8 dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/30 hover:border-indigo-400 transition-all shadow-sm hover:shadow-xl group">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                            <FiBookOpen className="w-6 h-6 dark:text-indigo-400 text-indigo-600 group-hover:text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold dark:text-white text-zinc-900 tracking-tight mb-1">{education.degree}</h3>
                            <p className="text-sm dark:text-indigo-400 text-indigo-600 font-bold">{education.field}</p>
                          </div>
                        </div>
                        
                        {education.isDiplomaPassed && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                            <FiAward className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Diplômé</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-lg font-bold dark:text-zinc-200 text-zinc-800 mb-4">{education.school}</h4>
                        
                        <div className="flex flex-wrap gap-5 text-sm font-medium dark:text-zinc-400 text-zinc-500">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 text-indigo-500" />
                            <span>{education.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 text-indigo-500" />
                            <span>
                              {formatDate(education.startDate)} - {' '}
                              {education.isCurrentlyStudying ? (
                                <span className="text-emerald-500 font-bold">En cours</span>
                              ) : education.isPaused ? (
                                <span className="text-amber-500 font-bold">En pause</span>
                              ) : (
                                formatDate(education.endDate!)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {education.description && (
                        <div className="dark:text-zinc-400 text-zinc-600 text-base leading-relaxed mb-6 font-medium">
                          {education.description}
                        </div>
                      )}
                      
                      {education.diplomaFile && (
                        <div className="pt-6 dark:border-white/5 border-zinc-100 border-t">
                          <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={education.diplomaFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 dark:bg-white/5 bg-zinc-50 dark:text-indigo-400 text-indigo-600 dark:border-white/10 border-zinc-200 border rounded-xl text-xs font-bold transition-all hover:bg-indigo-500/10 hover:border-indigo-400"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            Consulter le diplôme
                          </motion.a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 dark:bg-zinc-900/30 bg-zinc-50 rounded-3xl">
              <div className="w-20 h-20 rounded-3xl dark:bg-indigo-500/10 bg-indigo-100/50 flex items-center justify-center mx-auto mb-6">
                <FiBookOpen className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black dark:text-white text-zinc-900 mb-2">Aucune formation répertoriée</h3>
              <p className="dark:text-zinc-500 text-zinc-500 font-medium">Le cursus académique sera bientôt affiché.</p>
            </motion.div>
          )}
        </div>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    await connectDB();
    const educations = await Education.find({ isVisible: true }).sort({ startDate: -1 }).lean();

    return {
      props: {
        educations: JSON.parse(JSON.stringify(educations)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        educations: [],
      },
      revalidate: 60,
    };
  }
};
