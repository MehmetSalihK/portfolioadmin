import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { FaUser, FaCode, FaVideo, FaTools } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import DOMPurify from 'isomorphic-dompurify';
import parse from 'html-react-parser';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config.js';
import { useRouter } from 'next/router';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
import { getLocalized } from '@/utils/i18n-utils';

interface AboutSettings {
  aboutTitle?: string;
  aboutBio?: string;
  aboutImage?: string;
  siteTitle?: string;
}

interface AboutPageProps {
  settings: AboutSettings;
}

export default function About({ settings }: AboutPageProps) {
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  const features = [
    {
      icon: <FaCode className="w-5 h-5" />,
      title: t('about.expertise1_title'),
      desc: t('about.expertise1_desc'),
      accentCls: 'dark:bg-indigo-500/10 bg-indigo-50 dark:border-indigo-500/20 border-indigo-200 dark:text-indigo-400 text-indigo-600',
    },
    {
      icon: <FaVideo className="w-5 h-5" />,
      title: t('about.expertise2_title'),
      desc: t('about.expertise2_desc'),
      accentCls: 'dark:bg-violet-500/10 bg-violet-50 dark:border-violet-500/20 border-violet-200 dark:text-violet-400 text-violet-600',
    },
    {
      icon: <FaTools className="w-5 h-5" />,
      title: t('about.expertise3_title'),
      desc: t('about.expertise3_desc'),
      accentCls: 'dark:bg-emerald-500/10 bg-emerald-50 dark:border-emerald-500/20 border-emerald-200 dark:text-emerald-400 text-emerald-600',
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{settings.siteTitle ? `${t('about.hero_subtitle')} — ${settings.siteTitle}` : `${t('about.hero_subtitle')} — Portfolio`}</title>
        <meta name="description" content={t('about.hero_description')} />
      </Head>


      <div className="max-w-[1100px] mx-auto px-6 pt-24 pb-24">
        {/* HERO */}
        <section className="mb-20 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          >
            <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-6">
              {t('about.hero_subtitle')}
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold dark:text-white text-zinc-900 leading-[1.1] tracking-tight mb-6 text-balance">
              {t('about.hero_title_part1')} <span className="text-indigo-500 italic">{t('about.hero_title_part2')}</span>,{' '}
              {t('about.hero_title_part3')} <span className="text-indigo-500 italic">{t('about.hero_title_part4')}</span>.
            </h1>
            <p className="text-lg dark:text-zinc-500 text-zinc-500 max-w-[560px] leading-[1.75] font-normal">
              {t('about.hero_description')}
            </p>
          </motion.div>
        </section>


        {/* LES 3 IDENTITÉS */}
        <section className="mb-20">
          <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-8">{t('about.expertises_subtitle')}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.3, ease: [0.2, 0, 0, 1] }}
                className="p-6 rounded-2xl dark:bg-white/[0.02] bg-white border dark:border-white/[0.06] border-zinc-200 hover:dark:border-white/[0.1] hover:border-zinc-300 transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5 ${f.accentCls} border`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold dark:text-white text-zinc-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* BIO */}
        <section className="mb-16">
          <div className="dark:bg-white/[0.02] bg-white rounded-2xl p-8 md:p-12 dark:border-white/[0.06] border-zinc-200 border">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                {settings.aboutImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative aspect-square rounded-[2rem] overflow-hidden mb-8 border-4 dark:border-white/5 border-zinc-100 shadow-2xl group"
                  >
                    <Image
                      src={settings.aboutImage}
                      alt={settings.aboutTitle || 'Profile'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </motion.div>
                )}
                <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight mb-4 text-balance">
                  {settings.aboutTitle || t('about.philosophy_default_title')}
                </h2>
                <div className="w-12 h-1 bg-indigo-500 rounded-full" />
              </div>
              <div className="lg:col-span-8">
                <div className="dark:text-zinc-400 text-zinc-600 text-base leading-[1.8] space-y-4">
                  {settings.aboutBio ? (
                    parse(DOMPurify.sanitize(settings.aboutBio))
                  ) : (
                    <p>{t('about.philosophy_default_bio')}</p>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <Link
                    href="/contact"
                    className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {t('about.cta_project')}
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/projects"
                    className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors duration-150 flex items-center gap-1"
                  >
                    {t('about.cta_work')} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawSettings = await Setting.findOne({}).lean();
    
    // Map settings to active locale
    const settings = rawSettings ? {
      ...rawSettings,
      _id: (rawSettings as any)._id.toString(),
      aboutTitle: getLocalized(rawSettings, 'aboutTitle', currentLocale),
      aboutBio: getLocalized(rawSettings, 'aboutBio', currentLocale),
    } : {
      aboutTitle: 'Mon Parcours',
      aboutBio: '',
      aboutImage: '',
    };

    return {
      props: { 
        settings: JSON.parse(JSON.stringify(settings)),
        ...(await serverSideTranslations(currentLocale, ['common'], nextI18NextConfig)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error in About getStaticProps:", error);
    return {
      props: { 
        settings: { aboutTitle: 'Mon Parcours', aboutBio: '' },
        ...(await serverSideTranslations(currentLocale, ['common'], nextI18NextConfig)),
      },
      revalidate: 60,
    };
  }
};

