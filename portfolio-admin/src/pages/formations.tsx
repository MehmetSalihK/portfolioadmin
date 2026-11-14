import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import JSONLD from '@/components/layout/JSONLD';
import connectDB from '@/lib/db';
import Education from '@/models/Education';
import { FiArrowUpRight } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';
import SectionHead from '@/components/ui/SectionHead';
import { SectionMark } from '@/components/identity/Marks';
import { Reveal, RevealLines } from '@/components/motion/Reveal';

interface FormationsPageProps {
  educations: {
    _id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string | null;
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
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : (locale === 'en' ? 'en-GB' : 'fr-FR'), { year: 'numeric', month: 'short' });
  };

  const endLabel = (edu: FormationsPageProps['educations'][number]) => {
    if (edu.isCurrentlyStudying) return t('education.studying');
    if (edu.isPaused) return t('education.paused');
    return formatDate(edu.endDate);
  };

  return (
    <Layout>
      <JSONLD
        type="WebPage"
        data={{
          name: `${t('nav.education')} — MSK`,
          description: t('education.description'),
          url: 'https://mehmetsalihk.fr/formations',
        }}
      />
      <Head>
        <title>{`${t('nav.education')} — Portfolio`}</title>
        <meta name="description" content={t('education.description')} />
        <meta property="og:title" content={`${t('nav.education')} — Portfolio`} />
        <meta property="og:description" content={t('education.description')} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* ════════════ OUVERTURE ════════════ */}
      <section className="relative pt-[8.5rem] pb-2">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-9 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              {t('nav.education')} — {t('page_label.education')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 tabular-nums">
              {String(educations.length).padStart(2, '0')} {t('nav.education')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-8">
            <div className="lg:col-span-8">
              <h1 className="font-display font-black text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.05em] m-0 text-balance">
                <RevealLines delay={0.1} stagger={0.1}>
                  <span>
                    {t('education.title_part1')}{' '}
                    <span className="font-accent text-[1.1em] text-[var(--accent-text)] dark:text-[var(--accent)]">
                      {t('education.title_part2')}
                    </span>
                    <span className="text-[var(--accent-text)] dark:text-[var(--accent)]">.</span>
                  </span>
                </RevealLines>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-3">
              <Reveal delay={0.3}>
                <p className="lead m-0">{t('education.description')}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 01 — PARCOURS ════════════ */}
      <section className="relative mt-[var(--section-gap)]">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] pb-[var(--section-gap)]">
          <SectionHead
            index="01"
            kicker={t('education.subtitle')}
            sigil={<SectionMark name="skills" />}
            title={t('education.title_part1')}
          />

          {educations.length > 0 ? (
            <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/20">
              {educations.map((edu, i) => (
                <Reveal key={edu._id} delay={Math.min(i * 0.06, 0.3)} amount={0.3}>
                  <article className="group grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-5 py-8 lg:py-9 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo -mx-3 px-3">
                    {/* Index + dates */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)] tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {edu.isDiplomaPassed && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/60 border border-[rgb(var(--foreground-rgb))]/25 px-2 py-1 leading-none">
                            {t('education.graduated')}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[12px] leading-relaxed tracking-[0.03em] text-[rgb(var(--foreground-rgb))]/70 m-0 tabular-nums">
                        {formatDate(edu.startDate)}
                        <span className="text-[rgb(var(--foreground-rgb))]/60"> → </span>
                        <span className={edu.isCurrentlyStudying ? 'text-[var(--accent-text)] dark:text-[var(--accent)]' : ''}>
                          {endLabel(edu)}
                        </span>
                      </p>
                      {edu.location && (
                        <p className="font-mono text-[11px] tracking-[0.04em] text-[rgb(var(--foreground-rgb))]/60 mt-2 mb-0">
                          {edu.location}
                        </p>
                      )}
                    </div>

                    {/* Diplôme + établissement */}
                    <div className="lg:col-span-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]/60 m-0 mb-2.5">
                        {edu.field}
                      </p>
                      <h3 className="text-[1.4rem] sm:text-[1.6rem] font-bold leading-[1.08] tracking-[-0.03em] m-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                        {edu.degree}
                      </h3>
                      <p className="text-[0.975rem] font-medium text-[rgb(var(--foreground-rgb))]/75 mt-2.5 mb-0">
                        {edu.school}
                      </p>
                    </div>

                    {/* Description + diplôme */}
                    <div className="lg:col-span-5">
                      {edu.description && (
                        <p className="text-[0.975rem] leading-[1.7] text-[rgb(var(--foreground-rgb))]/68 m-0 max-w-[56ch]">
                          {edu.description}
                        </p>
                      )}
                      {edu.diplomaFile && (
                        <Link
                          href={edu.diplomaFile}
                          target="_blank"
                          className="link-arrow mt-5 inline-flex text-[var(--accent-text)] dark:text-[var(--accent)]"
                        >
                          {t('education.view_diploma')} <FiArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}

              <div className="flex items-center gap-4 pt-8">
                <span className="index-num tabular-nums">
                  {String(educations.length).padStart(2, '0')} / {String(educations.length).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-[rgb(var(--foreground-rgb))]/12" />
              </div>
            </div>
          ) : (
            <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/15 pt-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/60 m-0 mb-2">
                — {t('education.empty')}
              </p>
              <p className="text-[0.95rem] text-[rgb(var(--foreground-rgb))]/60 m-0">
                {t('education.empty_desc')}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawEducations = await Education.find({ isVisible: true }).sort({ startDate: -1 }).lean();
    const educations = rawEducations.map((edu: any) => {
      // Retire les données sensibles/techniques du rendu public :
      // `diplomaData` (fichier en base64) partait tel quel dans le HTML
      // de la page via __NEXT_DATA__ → accessible sans authentification.
      const { diplomaData, diplomaFilePath, diplomaFileName, ...publicFields } = edu;
      return {
        ...publicFields,
        degree: getLocalized(edu, 'degree', currentLocale),
        field: getLocalized(edu, 'field', currentLocale),
        description: getLocalized(edu, 'description', currentLocale),
        _id: edu._id.toString(),
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate ? edu.endDate.toISOString() : null,
      };
    });
    return { props: { educations: JSON.parse(JSON.stringify(educations)), ...(await serverSideTranslations(currentLocale, ['common'])), }, revalidate: 60 };
  } catch {
    return { props: { educations: [], ...(await serverSideTranslations(currentLocale, ['common'])), }, revalidate: 60 };
  }
};
