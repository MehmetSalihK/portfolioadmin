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

      <div className="min-h-screen dark:bg-[#09090f] bg-white relative pb-32 overflow-hidden pt-40 transition-colors duration-500">
        {/* Ambient background effects synchronized with Strategy */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] dark:bg-indigo-600/5 bg-indigo-50/40 rounded-full blur-[120px] opacity-70" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] dark:bg-violet-600/5 bg-violet-50/30 rounded-full blur-[120px] opacity-70" />
          <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-24"
          >
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
              <span className="w-10 h-[1px] bg-indigo-500" />
              Parcours Professionnel
            </div>
            <h1 className="text-5xl lg:text-7xl font-black dark:text-white text-zinc-900 tracking-tight mb-8">
              Expériences <span className="text-indigo-600 dark:text-indigo-500">concrètes</span>.
            </h1>
            <p className="text-zinc-600 dark:text-zinc-500 text-xl max-w-2xl leading-relaxed font-medium">
              Une rétrospective de mon évolution technique et des solutions complexes que j&apos;ai déployées en milieu professionnel.
            </p>
          </motion.div>

          {/* Timeline Section */}
          <div className="relative">
            {/* Timeline line - Refined */}
            <div className="absolute left-6 md:left-[35px] top-4 bottom-4 w-px dark:bg-indigo-500/20 bg-indigo-200 block" />
            
            <div className="space-y-16">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="pl-16 md:pl-24 relative"
                >
                  {/* Timeline dot with pulse glow */}
                  <div className="absolute left-4 md:left-[28.5px] top-9 w-4 h-4 rounded-full bg-indigo-500 border-[3px] dark:border-[#09090f] border-white shadow-[0_0_15px_rgba(99,102,241,0.4)] z-10" />
                  
                  <div className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[2.5rem] p-10 dark:border-white/5 border-zinc-200 border group hover:border-indigo-500/20 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden relative">
                    {/* Interior glow effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                    <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-10">
                        <div>
                           <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Position Active</span>
                              <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
                           </div>
                          <h2 className="text-3xl font-black dark:text-white text-zinc-900 tracking-tight mb-2 group-hover:text-indigo-500 transition-colors">
                            {experience.title}
                          </h2>
                          <div className="flex items-center gap-3">
                            <span className="font-bold dark:text-zinc-300 text-zinc-800 text-lg">
                              {experience.company}
                            </span>
                            <span className="dark:text-zinc-700 text-zinc-300">·</span>
                            <span className="dark:text-zinc-500 text-zinc-500 font-medium text-sm flex items-center gap-1.5">
                              <FiMapPin className="w-3.5 h-3.5 text-indigo-500" />
                              {experience.location}
                            </span>
                          </div>
                        </div>

                        <div className="inline-flex items-center px-5 py-2.5 dark:bg-white/5 bg-zinc-50 dark:text-zinc-400 text-zinc-600 dark:border-white/10 border-zinc-100 border rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap self-start">
                          <FiCalendar className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                          {formatDate(experience.startDate)}
                          <span className="mx-2 text-zinc-700">→</span>
                          {experience.isCurrentPosition || !experience.endDate 
                            ? <span className="text-emerald-500 font-black">Présent</span>
                            : formatDate(experience.endDate)
                          }
                        </div>
                      </div>

                      <div className="mb-10">
                        <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed text-lg font-medium">
                          {experience.description}
                        </p>
                      </div>

                      {experience.technologies && experience.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-10">
                          {experience.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1.5 dark:bg-white/5 bg-zinc-50 dark:text-zinc-500 text-zinc-500 dark:border-white/10 border-zinc-100 border rounded-xl text-[10px] font-black uppercase tracking-widest"
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
                           <span className="text-[10px] font-black dark:text-zinc-600 text-zinc-400 uppercase tracking-widest">Impact Validé</span>
                        </div>
                        
                        {experience.companyUrl && (
                          <a
                            href={experience.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all group/link"
                          >
                            Détails Entreprise
                            <FiLink className="w-3.5 h-3.5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
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