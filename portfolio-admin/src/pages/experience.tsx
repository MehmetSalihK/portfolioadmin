import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import Experience from '@/models/Experience';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <Layout>
      <Head>
        <title>Expériences — Portfolio</title>
        <meta name="description" content="Découvrez mon parcours professionnel et mes expériences." />
      </Head>

      <main className="min-h-screen dark:bg-[#0a0a0f] bg-[#fafafc] pt-14">
        <div className="max-w-[1100px] mx-auto px-6 pt-20 pb-24">

          {/* ── Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
            className="mb-16"
          >
            <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-5">
              Parcours professionnel
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold dark:text-white text-zinc-900 tracking-tight mb-5 text-balance">
              Mes <span className="text-indigo-500 italic">expériences</span>.
            </h1>
            <p className="dark:text-zinc-500 text-zinc-500 text-lg max-w-[520px] leading-[1.75]">
              Mon évolution de carrière et les défis techniques que j&apos;ai relevés.
            </p>
          </motion.div>

          {/* ── Séparateur ── */}
          <div className="border-t dark:border-white/[0.05] border-zinc-100 mb-12" />

          {/* ── Timeline ── */}
          {experiences.length > 0 ? (
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-5 top-2 bottom-2 w-px dark:bg-white/[0.06] bg-zinc-200 hidden sm:block" />

              <div className="space-y-6">
                {experiences.map((exp, i) => (
                  <motion.div
                    key={exp._id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06, ease: [0.2, 0, 0, 1] }}
                    className="relative sm:pl-14"
                  >
                    {/* Dot */}
                    <div className="absolute left-[17px] top-6 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 dark:ring-[#0a0a0f] ring-[#fafafc] hidden sm:block" />

                    <div className="dark:bg-white/[0.02] bg-white rounded-2xl p-6 border dark:border-white/[0.06] border-zinc-200 hover:dark:border-white/[0.1] hover:border-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30">

                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl dark:bg-indigo-500/10 bg-indigo-50 border dark:border-indigo-500/20 border-indigo-100 flex items-center justify-center shrink-0">
                            <FiBriefcase className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold dark:text-white text-zinc-900 tracking-tight leading-snug">
                              {exp.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-sm font-medium dark:text-zinc-400 text-zinc-600">{exp.company}</span>
                              {exp.location && (
                                <>
                                  <span className="dark:text-zinc-700 text-zinc-300">·</span>
                                  <span className="flex items-center gap-1 text-xs dark:text-zinc-500 text-zinc-500">
                                    <FiMapPin className="w-3 h-3" />{exp.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 dark:bg-indigo-500/10 bg-indigo-50 dark:border-indigo-500/20 border-indigo-100 border rounded-lg text-[11px] font-semibold dark:text-indigo-400 text-indigo-600 whitespace-nowrap">
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(exp.startDate)} — {exp.current ? 'Présent' : formatDate(exp.endDate!)}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {exp.description && (
                        <p className="text-sm dark:text-zinc-400 text-zinc-600 leading-relaxed mb-4">
                          {exp.description}
                        </p>
                      )}

                      {/* Achievements */}
                      {exp.achievements?.length > 0 && (
                        <div className="mb-4">
                          <div className="text-[10px] font-semibold dark:text-zinc-600 text-zinc-400 uppercase tracking-widest mb-3">
                            Réalisations clés
                          </div>
                          <ul className="space-y-2">
                            {exp.achievements.map((a, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm dark:text-zinc-400 text-zinc-600">
                                <span className="w-1 h-1 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                <span className="leading-relaxed">{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Technologies */}
                      {exp.technologies?.length > 0 && (
                        <div className="pt-4 border-t dark:border-white/[0.05] border-zinc-100">
                          <div className="flex flex-wrap gap-1.5">
                            {exp.technologies.map((tech, idx) => (
                              <span key={idx} className="px-2.5 py-1 dark:bg-white/[0.04] bg-zinc-50 dark:text-zinc-500 text-zinc-500 rounded-md text-[11px] font-medium border dark:border-white/[0.05] border-zinc-100">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 dark:bg-white/[0.02] bg-white rounded-2xl border dark:border-white/[0.06] border-zinc-200 border-dashed"
            >
              <div className="w-14 h-14 rounded-2xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center mx-auto mb-5">
                <FiBriefcase className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold dark:text-white text-zinc-900 mb-2">Aucune expérience trouvée</h3>
              <p className="dark:text-zinc-500 text-zinc-500 text-sm">Le parcours professionnel est en cours de mise à jour.</p>
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
    const experiences = await Experience.find({}).sort({ startDate: -1, order: -1 }).lean();
    return {
      props: { experiences: JSON.parse(JSON.stringify(experiences)) },
      revalidate: 60,
    };
  } catch {
    return { props: { experiences: [] }, revalidate: 60 };
  }
};
