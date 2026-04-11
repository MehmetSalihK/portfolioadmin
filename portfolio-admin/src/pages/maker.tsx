import { motion, useScroll } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import {
  FiCpu, FiTool, FiActivity, FiExternalLink, FiGithub, FiChevronRight,
  FiSmartphone, FiMonitor, FiWifi, FiServer
} from 'react-icons/fi';
import {
  SiArduino, SiRaspberrypi, SiDocker, SiLinux
} from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import JSONLD, { schemas } from '@/components/layout/JSONLD';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config.js';
import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';

interface Project {
  _id: string; title: string; description: string;
  imageUrl: string; technologies: string[];
  demoUrl?: string; githubUrl?: string; category?: string;
}

interface MakerPageProps { projects: Project[]; }

export default function MakerPage({ projects }: MakerPageProps) {
  const { scrollYProgress } = useScroll();
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  // Localized data
  const services = [
    {
      title: t('maker_page.service1_title'),
      desc: t('maker_page.service1_desc'),
      icon: FiActivity, accent: 'amber'
    },
    {
      title: t('maker_page.service2_title'),
      desc: t('maker_page.service2_desc'),
      icon: FiCpu, accent: 'emerald'
    },
    {
      title: t('maker_page.service3_title'),
      desc: t('maker_page.service3_desc'),
      icon: FiTool, accent: 'blue'
    }
  ];

  const competences = [
    {
      cat: t('maker_page.cat1'),
      icon: FiSmartphone,
      color: 'indigo',
      items: (t('maker_page.items1', { returnObjects: true }) || []) as string[]
    },
    {
      cat: t('maker_page.cat2'),
      icon: FiMonitor,
      color: 'amber',
      items: (t('maker_page.items2', { returnObjects: true }) || []) as string[]
    },
    {
      cat: t('maker_page.cat3'),
      icon: SiArduino,
      color: 'emerald',
      items: (t('maker_page.items3', { returnObjects: true }) || []) as string[]
    },
    {
      cat: t('maker_page.cat4'),
      icon: SiLinux,
      color: 'blue',
      items: (t('maker_page.items4', { returnObjects: true }) || []) as string[]
    },
  ];

  const accentColor = (a: string) =>
    a === 'amber' ? 'text-amber-500' :
    a === 'emerald' ? 'text-emerald-500' : 'text-blue-500';

  const accentBg = (a: string) =>
    a === 'amber' ? 'dark:bg-amber-500/10 bg-amber-50 dark:border-amber-500/20 border-amber-100' :
    a === 'emerald' ? 'dark:bg-emerald-500/10 bg-emerald-50 dark:border-emerald-500/20 border-emerald-100' :
    'dark:bg-blue-500/10 bg-blue-50 dark:border-blue-500/20 border-blue-100';

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.maker} />
      <Head>
        <title>{t('nav.maker')} — Portfolio</title>
        <meta name="description" content={t('maker_page.hero_description')} />
      </Head>

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-amber-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* ── HERO ── */}
      <section className="min-h-[95vh] flex items-center dark:bg-[#0a0a0f] bg-[#fafafc] pt-14 relative overflow-hidden">

        {/* ── Background images cascade (right side) ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] dark:bg-amber-600/5 bg-amber-100/20 rounded-full blur-[120px]" />

          {/* Photo 1 — Assemblage PC (top, slightly tilted right) */}
          <motion.div
            initial={{ opacity: 0, x: 70, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: 3 }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="absolute hidden lg:block right-[-40px] top-[55px] w-[380px] h-[220px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border dark:border-white/[0.08] border-zinc-200/60"
          >
            <Image
              src="/images/maker/Assemblage & Upgrade PC.jpg"
              alt="Assemblage PC"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l dark:from-[#0a0a0f]/10 from-[#fafafc]/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t dark:from-[#0a0a0f]/80 from-zinc-100/70 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Assemblage & Upgrade PC</span>
            </div>
          </motion.div>

          {/* Photo 2 — Smartphones (middle, tilted left) */}
          <motion.div
            initial={{ opacity: 0, x: 90, rotate: -2 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ delay: 0.42, duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="absolute hidden lg:block right-[80px] top-[255px] w-[340px] h-[200px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border dark:border-white/[0.08] border-zinc-200/60"
          >
            <Image
              src="/images/maker/Diagnostic & Réparation Smartphones.jpg"
              alt="Réparation Smartphones"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-emerald-900/10" />
            <div className="absolute inset-0 bg-gradient-to-l dark:from-[#0a0a0f]/5 from-[#fafafc]/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t dark:from-[#0a0a0f]/80 from-zinc-100/70 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Diagnostic Smartphones</span>
            </div>
          </motion.div>

          {/* Photo 3 — IoT (bottom, tilted right again) */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="absolute hidden lg:block right-[-20px] top-[435px] w-[310px] h-[185px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border dark:border-white/[0.08] border-zinc-200/60"
          >
            <Image
              src="/images/maker/Prototypage IoT & Électronique.jpg"
              alt="Prototypage IoT"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-orange-900/10" />
            <div className="absolute inset-0 bg-gradient-to-l dark:from-[#0a0a0f]/5 from-[#fafafc]/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t dark:from-[#0a0a0f]/80 from-zinc-100/70 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Prototypage IoT</span>
            </div>
          </motion.div>

          {/* Right edge fade */}
          <div className="absolute right-0 top-0 bottom-0 w-[220px] bg-gradient-to-l dark:from-[#0a0a0f] from-[#fafafc] to-transparent hidden lg:block" />
        </div>

        <div className="max-w-[1100px] mx-auto px-6 w-full relative z-10">
          <div className="max-w-[560px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 dark:bg-amber-500/10 bg-amber-50 dark:border-amber-500/20 border-amber-100 border rounded-full mb-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-widest">{t('maker_page.hero_subtitle')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold dark:text-white text-zinc-900 leading-[1.05] tracking-tight mb-6 text-balance"
            >
              {t('maker_page.hero_title_part1')}{' '}
              {locale === 'tr' ? '' : t('maker_page.hero_title_part2')}{' '}
              <span className="text-amber-500 italic">{locale === 'tr' ? t('maker_page.hero_title_part2') : ''}</span>
              {locale === 'tr' ? ' ' + t('maker_page.hero_title_part3') : '.'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="text-lg dark:text-zinc-500 text-zinc-500 mb-10 max-w-[560px] leading-[1.75]"
            >
              {t('maker_page.hero_description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/contact" className="h-11 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg shadow-amber-600/20">
                {t('maker_page.cta_start')}
              </Link>
              <Link href="/projects" className="h-11 px-6 dark:bg-white/[0.04] bg-white dark:hover:bg-white/[0.08] hover:bg-zinc-100 dark:text-zinc-200 text-zinc-700 dark:border-white/[0.08] border-zinc-200 border rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2">
                {t('maker_page.cta_projects')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 dark:bg-[#0a0a0f] bg-[#fafafc] border-t dark:border-white/[0.05] border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest mb-10">{t('maker_page.services_subtitle')}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: [0.2, 0, 0, 1] }}
                className="p-6 dark:bg-white/[0.02] bg-white rounded-2xl border dark:border-white/[0.06] border-zinc-200 hover:dark:border-white/[0.1] hover:border-zinc-300 transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5 border ${accentBg(s.accent)}`}>
                  <s.icon className={`w-4 h-4 ${accentColor(s.accent)}`} />
                </div>
                <h3 className="text-sm font-bold dark:text-white text-zinc-900 mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPÉTENCES ── */}
      <section className="py-20 dark:bg-zinc-950 bg-zinc-900 text-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest mb-10">{t('maker_page.competences_subtitle')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {competences.map((cat, i) => {
              const iconColorClass =
                cat.color === 'indigo' ? 'text-indigo-400 bg-indigo-500/15 border-indigo-500/25' :
                cat.color === 'amber' ? 'text-amber-400 bg-amber-500/15 border-amber-500/25' :
                cat.color === 'emerald' ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25' :
                'text-blue-400 bg-blue-500/15 border-blue-500/25';
              const CatIcon = cat.icon as React.ComponentType<{ className?: string }>;
              return (
                <div key={i} className="p-5 bg-white/[0.03] rounded-xl border border-white/[0.07] hover:border-white/[0.12] transition-all duration-200">
                  <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border mb-4 ${iconColorClass}`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-4 text-amber-400">{cat.cat}</div>
                   <ul className="space-y-2.5">
                    {Array.isArray(cat.items) && cat.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Icônes marques */}
          <div className="mt-8 pt-8 border-t border-white/[0.06] flex flex-wrap items-center gap-6">
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">{t('maker_page.tools_label')}</div>
            {[
              { icon: SiArduino, color: '#00979D', label: 'Arduino' },
              { icon: SiRaspberrypi, color: '#C51A4A', label: 'Raspberry Pi' },
              { icon: SiDocker, color: '#2496ED', label: 'Docker' },
              { icon: SiLinux, color: '#FCC624', label: 'Linux' },
            ].map((t, i) => (
              <div key={i} title={t.label} className="flex items-center gap-2 group cursor-default">
                <t.icon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: t.color }} />
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJETS ── */}
      {projects.length > 0 && (
        <section className="py-20 dark:bg-[#0a0a0f] bg-[#fafafc] border-t dark:border-white/[0.05] border-zinc-100">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
              <div>
                <div className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest mb-3">{t('maker_page.projects_subtitle')}</div>
                <h2 className="text-3xl font-extrabold dark:text-white text-zinc-900 tracking-tight">{t('maker_page.projects_title')}</h2>
              </div>
              <Link href="/projects" className="text-[12px] font-semibold text-amber-500 flex items-center gap-1 hover:gap-2 transition-all duration-150">
                {t('projects.all')} <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="group dark:bg-white/[0.02] bg-white rounded-2xl border dark:border-white/[0.06] border-zinc-200 hover:dark:border-white/[0.1] hover:border-zinc-300 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/40"
                >
                  <div className="relative aspect-[16/9] dark:bg-zinc-900 bg-zinc-100 overflow-hidden">
                    <Image src={p.imageUrl} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="540px" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-bold dark:text-white text-zinc-900 tracking-tight">{p.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors"><FiGithub className="w-4 h-4" /></a>}
                        {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 dark:text-zinc-600 text-zinc-400 hover:dark:text-zinc-300 hover:text-zinc-600 transition-colors"><FiExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.technologies.slice(0, 4).map((t, ti) => (
                        <span key={ti} className="px-2.5 py-1 dark:bg-white/[0.04] bg-zinc-50 dark:text-zinc-500 text-zinc-500 rounded-md text-[10px] font-medium border dark:border-white/[0.05] border-zinc-100">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-700" />
        <div className="max-w-[1100px] mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-balance">
            {t('maker_page.footer_cta_title_part1')} <span className="text-amber-200">{t('maker_page.footer_cta_title_part2')}</span> {locale === 'tr' ? t('maker_page.footer_cta_title_part3') : '?' }
          </h2>
          <p className="text-lg text-amber-100 mb-10 max-w-[480px] mx-auto leading-[1.75] opacity-90">
            {t('maker_page.footer_cta_description')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="h-11 px-6 bg-white text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg">
              {t('maker_page.cta_start')}
            </Link>
            <Link href="/projects" className="h-11 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2">
              {t('projects.subtitle')}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const rawProjects = await ProjectModel.find({
      archived: { $ne: true }
    }).sort({ featured: -1, order: 1 }).limit(4).lean();

    const projects = rawProjects.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      title: getLocalized(p, 'title', currentLocale),
      description: getLocalized(p, 'description', currentLocale),
    }));

    return {
      props: { 
        projects: JSON.parse(JSON.stringify(projects)),
        ...(await serverSideTranslations(currentLocale, ['common'], nextI18NextConfig)),
      },
      revalidate: 60,
    };
  } catch {
    return { 
      props: { 
        projects: [],
        ...(await serverSideTranslations(currentLocale, ['common'], nextI18NextConfig)),
      } 
    };
  }
};

