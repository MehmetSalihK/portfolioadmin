import connectDB from '@/lib/db';
import ExperienceModel from '@/models/Experience';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { getLocalized } from '@/utils/i18n-utils';
import { useRouter } from 'next/router';
import { fr, enUS, tr } from 'date-fns/locale';
import Head from 'next/head';
import { FiArrowUpRight } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import JSONLD from '@/components/layout/JSONLD';
import SectionHead from '@/components/ui/SectionHead';
import { SectionMark } from '@/components/identity/Marks';
import { Reveal, EASE } from '@/components/motion/Reveal';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string | null;
  isCurrentPosition?: boolean;
  description: string;
  companyUrl?: string;
  technologies: string[];
}

interface ExperiencesPageProps {
  experiences: Experience[];
}

export default function ExperiencesPage({ experiences = [] }: ExperiencesPageProps) {
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  const getDateLocale = () => {
    if (locale === 'en') return enUS;
    if (locale === 'tr') return tr;
    return fr;
  };

  const formatDate = (date: string) => {
    try {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return t('common.invalid_date');
      return format(d, 'MMMM yyyy', { locale: getDateLocale() });
    } catch {
      return t('common.date_error');
    }
  };

  const formatRange = (exp: Experience) => {
    const start = formatDate(exp.startDate);
    const end = exp.isCurrentPosition || !exp.endDate ? t('experience.present') : formatDate(exp.endDate);
    return { start, end, current: exp.isCurrentPosition || !exp.endDate };
  };

  return (
    <Layout>
      <JSONLD
        type="WebPage"
        data={{
          name: `${t('experience.title')} — MSK`,
          description: t('experience.subtitle'),
          url: 'https://mehmetsalihk.fr/experiences',
        }}
      />
      <Head>
        <title>{`${t('experience.title')} — Portfolio`}</title>
        <meta name="description" content={t('experience.description_full')} />
        <meta property="og:title" content={`${t('experience.title')} — Portfolio`} />
        <meta property="og:description" content={t('experience.description_full')} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* ════════════ OUVERTURE ════════════ */}
      <section className="relative pt-[8.5rem] pb-2">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-9 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              {t('nav.experience')} — {t('page_label.experience')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 tabular-nums">
              {String(experiences.length).padStart(2, '0')} {t('experience.title')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-8">
            <div className="lg:col-span-8">
              <h1 className="font-display font-black text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.05em] m-0 text-balance">
                {t('experience.title')}
                <span className="font-accent text-[1.08em] text-[var(--accent-text)] dark:text-[var(--accent)]">
                  {' '}{t('common.concrete')}
                </span>
                <span className="text-[var(--accent-text)] dark:text-[var(--accent)]">.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-3">
              <Reveal delay={0.25}>
                <p className="lead m-0">{t('experience.description_full')}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 01 — CHRONOLOGIE ════════════ */}
      <section className="relative mt-[var(--section-gap)]">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] pb-[var(--section-gap)]">
          <SectionHead
            index="01"
            kicker={t('experience.subtitle')}
            sigil={<SectionMark name="experience" />}
            title={t('experience.impact_validated')}
          />

          {experiences.length === 0 ? (
            <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/15 pt-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/60">
                — {t('experience.empty')}
              </p>
            </div>
          ) : (
            <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/20">
              {experiences.map((experience, index) => {
                const { start, end, current } = formatRange(experience);
                return (
                  <Reveal key={experience._id} delay={Math.min(index * 0.06, 0.3)} amount={0.25}>
                    <article className="group grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-5 py-8 lg:py-10 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo -mx-3 px-3">
                      {/* Colonne date + index */}
                      <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)] tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {current && (
                            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent-text)] dark:text-[var(--accent)]">
                              <StatusDot />
                              {t('experience.active_position')}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[12px] leading-relaxed tracking-[0.03em] text-[rgb(var(--foreground-rgb))]/70 m-0 tabular-nums">
                          {start}
                          <span className="text-[rgb(var(--foreground-rgb))]/60"> → </span>
                          <span className={current ? 'text-[var(--accent-text)] dark:text-[var(--accent)]' : ''}>
                            {end}
                          </span>
                        </p>
                        <p className="font-mono text-[11px] tracking-[0.04em] text-[rgb(var(--foreground-rgb))]/60 mt-2 mb-0">
                          {experience.location}
                        </p>
                      </div>

                      {/* Poste + société */}
                      <div className="lg:col-span-4">
                        <h2 className="text-[1.4rem] sm:text-[1.65rem] font-bold leading-[1.08] tracking-[-0.03em] m-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                          {experience.title}
                        </h2>
                        <p className="text-[0.975rem] font-medium text-[rgb(var(--foreground-rgb))]/75 mt-2.5 mb-0">
                          {experience.company}
                        </p>
                        {experience.companyUrl && (
                          <a
                            href={experience.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-arrow mt-4 inline-flex text-[rgb(var(--foreground-rgb))]/60"
                          >
                            {t('experience.company_details')} <FiArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Description + stack */}
                      <div className="lg:col-span-5">
                        <p className="text-[0.975rem] leading-[1.7] text-[rgb(var(--foreground-rgb))]/68 m-0 max-w-[56ch]">
                          {experience.description}
                        </p>
                        {(experience.technologies || []).length > 0 && (
                          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4 border-t border-[rgb(var(--foreground-rgb))]/10">
                            {experience.technologies.map((tech) => (
                              <span key={tech} className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/60">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </Reveal>
                );
              })}

              {/* Filet de clôture */}
              <div className="flex items-center gap-4 pt-8">
                <span className="index-num tabular-nums">
                  {String(experiences.length).padStart(2, '0')} / {String(experiences.length).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-[rgb(var(--foreground-rgb))]/12" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]/60">
                  {t('experience.present')}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

/* Pastille « en cours » — repère d'atelier */
const StatusDot = () => <span className="inline-block w-1.5 h-1.5 bg-[var(--accent)] shrink-0" />;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawExperiences = await ExperienceModel.find({ isVisible: { $ne: false } })
      .sort({ startDate: -1 }).lean();
    const experiences = rawExperiences.map((exp: any) => ({
      ...exp,
      _id: exp._id.toString(),
      title: getLocalized(exp, 'title', currentLocale),
      description: getLocalized(exp, 'description', currentLocale),
      startDate: exp.startDate instanceof Date ? exp.startDate.toISOString() : new Date(exp.startDate).toISOString(),
      endDate: exp.endDate ? (exp.endDate instanceof Date ? exp.endDate.toISOString() : new Date(exp.endDate).toISOString()) : null,
    }));
    return {
      props: { experiences: JSON.parse(JSON.stringify(experiences)), ...(await serverSideTranslations(currentLocale, ['common'])), },
      revalidate: 60
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des expériences:', error);
    return { props: { experiences: [], ...(await serverSideTranslations(currentLocale, ['common'])), }, revalidate: 60 };
  }
};
