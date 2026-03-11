import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';
import useAnalytics from '@/utils/hooks/useAnalytics';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiBriefcase } from 'react-icons/fi';

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
  useAnalytics({
    enabled: true,
    updateInterval: 30000,
    trackTimeSpent: true
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <Layout>
      <Head>
        <title>Portfolio - Expériences</title>
        <meta name="description" content="Découvrez mon parcours professionnel et mes expériences." />
      </Head>

      <main className="relative min-h-screen dark:bg-[#09090f] bg-white pt-32 pb-24 overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] dark:bg-indigo-600/5 bg-indigo-50/40 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] dark:bg-violet-600/5 bg-violet-50/30 rounded-full blur-3xl opacity-50" />
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
              Parcours
            </div>
            <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">
              Expériences Professionnelles
            </h1>
            <p className="dark:text-zinc-400 text-zinc-600 text-lg font-medium max-w-xl">
              Mon évolution de carrière et les défis techniques que j&apos;ai relevés.
            </p>
          </motion.div>

          {/* Timeline */}
          {experiences && experiences.length > 0 ? (
            <div className="relative">
              {/* Vertical line - hidden on very small mobile, visible from sm up */}
              <div className="absolute left-4 md:left-[31px] top-6 bottom-6 w-px dark:bg-indigo-500/20 bg-indigo-200 hidden sm:block" />

              <div className="space-y-12">
                {experiences.map((experience, index) => (
                  <motion.div
                    key={experience._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative pl-0 sm:pl-16"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[24.5px] top-7 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 dark:border-[#09090f] border-white shadow-md shadow-indigo-500/40 hidden sm:block z-10" />
                    
                    <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl p-7 lg:p-10 dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/30 hover:border-indigo-400 transition-all shadow-sm hover:shadow-xl group">
                      {/* Card Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">
                            {experience.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                            <span className="dark:text-white text-zinc-800 font-bold">{experience.company}</span>
                            <span className="dark:text-zinc-700 text-zinc-300 hidden sm:inline">·</span>
                            <div className="flex items-center gap-1.5 dark:text-zinc-500 text-zinc-500">
                              <FiMapPin className="w-3.5 h-3.5" />
                              <span>{experience.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center gap-2 px-4 py-2 dark:bg-indigo-500/10 bg-indigo-50 dark:border-indigo-500/20 border-indigo-200 border rounded-full text-xs font-bold dark:text-indigo-400 text-indigo-600 whitespace-nowrap shadow-sm">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(experience.startDate)}
                            {' — '}
                            {experience.current ? 'Présent' : formatDate(experience.endDate!)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {experience.description && (
                        <p className="dark:text-zinc-300 text-zinc-600 leading-relaxed text-base mb-6 font-medium">
                          {experience.description}
                        </p>
                      )}
                      
                      {/* Achievements */}
                      {experience.achievements && experience.achievements.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-xs font-bold dark:text-zinc-500 text-zinc-400 uppercase tracking-widest mb-4">Réalisations clés</h4>
                          <ul className="space-y-3">
                            {experience.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm dark:text-zinc-400 text-zinc-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                                <span className="leading-relaxed">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Technologies */}
                      {experience.technologies && experience.technologies.length > 0 && (
                        <div className="pt-6 dark:border-white/5 border-zinc-100 border-t">
                          <div className="flex flex-wrap gap-2">
                            {experience.technologies.map((tech, i) => (
                              <span key={i} className="px-3 py-1.5 dark:bg-white/5 bg-zinc-50 dark:text-zinc-400 text-zinc-500 dark:border-white/10 border-zinc-200 border rounded-xl text-xs font-bold transition-all hover:bg-indigo-500/10 hover:text-indigo-400">
                                {tech}
                              </span>
                            ))}
                          </div>
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
                <FiBriefcase className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black dark:text-white text-zinc-900 mb-2">Aucune expérience trouvée</h3>
              <p className="dark:text-zinc-500 text-zinc-500 font-medium">Le parcours professionnel est en cours de mise à jour.</p>
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
