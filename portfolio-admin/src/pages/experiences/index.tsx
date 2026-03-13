import Head from 'next/head';
import Layout from '@/components/layouts/Layout';
import { FiBriefcase, FiMapPin, FiCalendar, FiLink, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';
import ExperienceModel from '@/models/Experience';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrentPosition: boolean;
  description: string;
  companyUrl?: string;
  technologies: string[];
}

interface ExperiencesPageProps {
  experiences: Experience[];
}

export default function ExperiencesPage({ experiences }: ExperiencesPageProps) {
  const { theme } = useTheme();

  const formatDate = (date: string) => {
    try {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Date invalide';
      return format(d, 'MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Erreur date';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Expériences | Portfolio Professionnel</title>
        <meta name="description" content="Mon parcours professionnel et mes missions" />
      </Head>

      <div className="min-h-screen dark:bg-[#09090f] bg-white relative pb-24 overflow-hidden pt-32 transition-colors duration-500">
        {/* Ambient background effects like Home page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] dark:bg-indigo-600/10 bg-indigo-50/50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] dark:bg-violet-600/8 bg-violet-50/40 rounded-full blur-3xl opacity-50" />
          <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)] opacity-70" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Header Section - Synced with Home page header style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
              <span className="w-8 h-[1px] bg-indigo-500" />
              Parcours
            </div>
            <h1 className="text-4xl lg:text-6xl font-black dark:text-white text-zinc-900 tracking-tight mb-6">
              Expériences <span className="text-indigo-600 dark:text-indigo-500">professionnelles</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
              Retrouvez ici les différentes étapes de ma carrière, mes réalisations et les technologies que j'ai maîtrisées au fil de mes missions.
            </p>
          </motion.div>

          {/* Timeline Section - Exact Home page style */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-2 bottom-2 w-px dark:bg-indigo-500/20 bg-indigo-200 hidden md:block" />
            
            <div className="space-y-12">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="md:pl-16 relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-3.5 top-7 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 dark:border-[#09090f] border-white shadow-md shadow-indigo-500/40 hidden md:block z-10" />
                  
                  <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl p-8 lg:p-10 dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/20 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-xl group relative overflow-hidden">
                    {/* Subtle internal gradient glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                        <div>
                          <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {experience.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="font-bold dark:text-white text-zinc-800 text-lg uppercase tracking-wide">
                              {experience.company}
                            </span>
                            <span className="dark:text-zinc-700 text-zinc-400">·</span>
                            <span className="dark:text-zinc-500 text-zinc-500 font-medium">
                              {experience.location}
                            </span>
                          </div>
                        </div>

                        <div className="inline-flex items-center px-4 py-2 dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200 border rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap self-start lg:self-center">
                          <FiCalendar className="w-3.5 h-3.5 mr-2" />
                          {formatDate(experience.startDate)}
                          <span className="mx-2">→</span>
                          {experience.isCurrentPosition || !experience.endDate 
                            ? <span className="text-indigo-600 dark:text-indigo-400 animate-pulse">Présent</span>
                            : formatDate(experience.endDate)
                          }
                        </div>
                      </div>

                      <div className="mb-10">
                        <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed text-lg font-medium italic opacity-90">
                          {experience.description}
                        </p>
                      </div>

                      {experience.technologies && experience.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-10">
                          {experience.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1.5 dark:bg-white/5 bg-zinc-50 dark:text-zinc-400 text-zinc-600 dark:border-white/10 border-zinc-200 border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-500 transition-all"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-8 border-t dark:border-white/5 border-zinc-100">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center border dark:border-indigo-500/20 border-indigo-100">
                             <FiCheckCircle className="w-5 h-5 text-indigo-500" />
                           </div>
                           <span className="text-xs font-bold dark:text-zinc-600 text-zinc-400 uppercase tracking-widest">Mission accomplie</span>
                        </div>
                        
                        {experience.companyUrl && (
                          <a
                            href={experience.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-2.5 dark:bg-white/5 bg-zinc-100 dark:hover:bg-white/10 hover:bg-zinc-200 dark:text-white text-zinc-900 dark:border-white/10 border-zinc-300 border rounded-xl text-xs font-bold transition-all group/link"
                          >
                            Détails entreprise
                            <FiLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
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
    const experiences = await ExperienceModel.find({ isVisible: { $ne: false } })
      .sort({ startDate: -1 })
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