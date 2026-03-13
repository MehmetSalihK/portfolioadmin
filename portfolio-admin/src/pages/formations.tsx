import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import Education from '@/models/Education';
import { FiBookOpen, FiCalendar, FiMapPin, FiAward, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

      <main className="relative min-h-screen dark:bg-[#09090f] bg-white pt-40 pb-32 overflow-hidden">
        {/* Ambient Background synchronized with Design Strategy */}
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
            className="mb-24"
          >
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
              <span className="w-10 h-[1px] bg-indigo-500" />
              Cursus Académique
            </div>
            <h1 className="text-5xl md:text-6xl font-black dark:text-white text-zinc-900 tracking-tight mb-8">
              Mes <span className="text-indigo-600 dark:text-indigo-500">Formations</span>.
            </h1>
            <p className="dark:text-zinc-500 text-zinc-600 text-xl font-medium max-w-2xl leading-relaxed">
              Les fondations de mes connaissances théoriques et mes certifications académiques au fil des années.
            </p>
          </motion.div>

          {/* Timeline Section */}
          {educations.length > 0 ? (
            <div className="relative">
              {/* Central Vertical line Type - Refined */}
              <div className="absolute left-6 md:left-[35px] top-4 bottom-4 w-px dark:bg-indigo-500/20 bg-indigo-200 block" />

              <div className="space-y-16">
                {educations.map((education, index) => (
                  <motion.div
                    key={education._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative pl-16 md:pl-24"
                  >
                    {/* Timeline dot with glow */}
                    <div className="absolute left-4 md:left-[28.5px] top-9 w-4 h-4 rounded-full bg-indigo-500 border-[3px] dark:border-[#09090f] border-white shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10" />
                    
                    <div className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[2.5rem] p-10 dark:border-white/5 border-zinc-200 border group hover:border-indigo-500/20 transition-all duration-500 shadow-sm hover:shadow-2xl">
                      {/* Top Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border dark:border-indigo-500/20 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                             <FiAward className="w-6 h-6 text-indigo-500 group-hover:text-white" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1 block">Diplôme & Titre</span>
                            <h3 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight">{education.degree}</h3>
                          </div>
                        </div>

                        {education.isDiplomaPassed && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Diplômé</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                        <div className="lg:col-span-8">
                          <h4 className="text-lg font-bold dark:text-zinc-200 text-zinc-800 mb-4 flex items-center gap-2">
                             {education.school}
                          </h4>
                          <p className="dark:text-zinc-500 text-zinc-600 text-base leading-relaxed font-medium">
                            {education.description}
                          </p>
                        </div>
                        <div className="lg:col-span-4 space-y-4">
                           <div className="p-5 rounded-2xl dark:bg-white/5 bg-zinc-50 border dark:border-white/5 border-zinc-100">
                             <div className="flex items-center gap-3 text-sm font-bold dark:text-zinc-400 text-zinc-500 mb-2">
                               <FiCalendar className="w-4 h-4 text-indigo-500" />
                               <span>Période</span>
                             </div>
                             <div className="text-sm dark:text-white text-zinc-900 font-black">
                                {formatDate(education.startDate)} — {education.isCurrentlyStudying ? 'En cours' : formatDate(education.endDate!)}
                             </div>
                           </div>
                            <div className="p-5 rounded-2xl dark:bg-white/5 bg-zinc-50 border dark:border-white/5 border-zinc-100">
                             <div className="flex items-center gap-3 text-sm font-bold dark:text-zinc-400 text-zinc-500 mb-2">
                               <FiMapPin className="w-4 h-4 text-indigo-500" />
                               <span>Localisation</span>
                             </div>
                             <div className="text-sm dark:text-white text-zinc-900 font-black">
                                {education.location}
                             </div>
                           </div>
                        </div>
                      </div>

                      {education.diplomaFile && (
                        <div className="pt-8 border-t dark:border-white/5 border-zinc-100">
                           <Link 
                            href={education.diplomaFile} 
                            target="_blank"
                            className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all group/link"
                          >
                            Consulter le Diplôme Certifié
                            <FiExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 dark:bg-zinc-900/20 bg-zinc-50 rounded-[3rem] border-2 border-dashed dark:border-white/5 border-zinc-200">
              <div className="w-24 h-24 rounded-3xl dark:bg-indigo-500/10 bg-indigo-100 flex items-center justify-center mx-auto mb-8">
                <FiBookOpen className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black dark:text-white text-zinc-900 mb-2">Aucune formation répertoriée</h3>
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
