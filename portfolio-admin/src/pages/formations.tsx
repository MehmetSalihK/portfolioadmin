import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import Education from '@/models/Education';
import { FiBookOpen, FiCalendar, FiMapPin, FiAward, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';

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

  const router = useRouter();
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : (locale === 'en' ? 'en-GB' : 'fr-FR'), { year: 'numeric', month: 'short' });
  };

  return (
    <Layout>
      <Head>
        <title>{t('nav.education')} — Portfolio</title>
        <meta name="description" content={t('education.description')} />
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
              {t('education.subtitle')}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold dark:text-white text-zinc-900 tracking-tight mb-5 text-balance">
              {t('education.title_part1')} <span className="text-indigo-500 italic">{t('education.title_part2')}</span>.
            </h1>
            <p className="dark:text-zinc-500 text-zinc-500 text-lg max-w-[520px] leading-[1.75]">
              {t('education.description')}
            </p>
          </motion.div>

          {/* ── Séparateur ── */}
          <div className="border-t dark:border-white/[0.05] border-zinc-100 mb-12" />

          {/* ── Timeline ── */}
          {educations.length > 0 ? (
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-5 top-2 bottom-2 w-px dark:bg-white/[0.06] bg-zinc-200" />

              <div className="space-y-6">
                {educations.map((edu, i) => (
                  <motion.div
                    key={edu._id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.06, ease: [0.2, 0, 0, 1] }}
                    className="relative pl-14"
                  >
                    {/* Dot */}
                    <div className="absolute left-[17px] top-6 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 dark:ring-[#0a0a0f] ring-[#fafafc]" />

                    <div className="dark:bg-white/[0.02] bg-white rounded-2xl p-6 border dark:border-white/[0.06] border-zinc-200 hover:dark:border-white/[0.1] hover:border-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30">
                      
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl dark:bg-indigo-500/10 bg-indigo-50 border dark:border-indigo-500/20 border-indigo-100 flex items-center justify-center shrink-0">
                            <FiAward className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">
                              {edu.field}
                            </div>
                            <h3 className="text-base font-bold dark:text-white text-zinc-900 tracking-tight leading-snug">
                              {edu.degree}
                            </h3>
                          </div>
                        </div>

                        {edu.isDiplomaPassed && (
                          <div className="flex items-center gap-1.5 px-3 py-1 dark:bg-emerald-500/10 bg-emerald-50 rounded-full border dark:border-emerald-500/20 border-emerald-200 shrink-0">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('education.graduated')}</span>
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <span className="flex items-center gap-1.5 text-xs dark:text-zinc-500 text-zinc-500">
                          <FiBookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          {edu.school}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs dark:text-zinc-500 text-zinc-500">
                          <FiCalendar className="w-3.5 h-3.5 text-indigo-500" />
                          {formatDate(edu.startDate)} — {edu.isCurrentlyStudying ? t('education.studying') : formatDate(edu.endDate!)}
                        </span>
                        {edu.location && (
                          <span className="flex items-center gap-1.5 text-xs dark:text-zinc-500 text-zinc-500">
                            <FiMapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {edu.location}
                          </span>
                        )}
                      </div>

                      {edu.description && (
                        <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed">
                          {edu.description}
                        </p>
                      )}

                      {edu.diplomaFile && (
                        <div className="mt-4 pt-4 border-t dark:border-white/[0.05] border-zinc-100">
                          <Link
                            href={edu.diplomaFile}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                          >
                            {t('education.view_diploma')}
                            <FiExternalLink className="w-3.5 h-3.5" />
                          </Link>
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
                <FiBookOpen className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold dark:text-white text-zinc-900 mb-2">{t('education.empty')}</h3>
              <p className="dark:text-zinc-500 text-zinc-500 text-sm">{t('education.empty_desc')}</p>
            </motion.div>
          )}
        </div>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawEducations = await Education.find({ isVisible: true }).sort({ startDate: -1 }).lean();
    
    const educations = rawEducations.map((edu: any) => ({
      ...edu,
      degree: getLocalized(edu, 'degree', currentLocale),
      field: getLocalized(edu, 'field', currentLocale),
      description: getLocalized(edu, 'description', currentLocale),
      _id: edu._id.toString(),
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate ? edu.endDate.toISOString() : null,
    }));

    return {
      props: { 
        educations: JSON.parse(JSON.stringify(educations)),
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  } catch {
    return { 
      props: { 
        educations: [],
        ...(await serverSideTranslations(currentLocale, ['common'])),
      }, 
      revalidate: 60 
    };
  }
};

