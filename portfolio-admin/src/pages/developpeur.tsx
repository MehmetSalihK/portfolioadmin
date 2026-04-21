import { motion, useScroll } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import {
  FiLayers, FiCpu, FiZap, FiExternalLink, FiGithub, FiChevronRight, FiCode
} from 'react-icons/fi';
import {
  SiNextdotjs, SiReact, SiNodedotjs, SiMongodb,
  SiTypescript, SiTailwindcss, SiDocker, SiRedis
} from 'react-icons/si';
import JSONLD, { schemas } from '@/components/layout/JSONLD';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  _id: string; title: string; description: string;
  imageUrl: string; technologies: string[];
  demoUrl?: string; githubUrl?: string; category?: string;
}

interface DeveloppeurPageProps { projects: Project[]; }

export default function DeveloppeurPage({ projects }: DeveloppeurPageProps) {
  const { scrollYProgress } = useScroll();
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  // Localized data
  const services = [
    {
      title: t('dev_page.service1_title'),
      desc: t('dev_page.service1_desc'),
      icon: FiLayers, accent: 'indigo'
    },
    {
      title: t('dev_page.service2_title'),
      desc: t('dev_page.service2_desc'),
      icon: FiCpu, accent: 'violet'
    },
    {
      title: t('dev_page.service3_title'),
      desc: t('dev_page.service3_desc'),
      icon: FiZap, accent: 'emerald'
    }
  ];

  const process = [
    { n: '01', t: t('dev_page.step1_title'), d: t('dev_page.step1_desc') },
    { n: '02', t: t('dev_page.step2_title'), d: t('dev_page.step2_desc') },
    { n: '03', t: t('dev_page.step3_title'), d: t('dev_page.step3_desc') },
    { n: '04', t: t('dev_page.step4_title'), d: t('dev_page.step4_desc') },
  ];

  const stack = {
    "Frontend": [
      { label: "Next.js", icon: SiNextdotjs },
      { label: "React", icon: SiReact },
      { label: "Typescript", icon: SiTypescript },
      { label: "Tailwind CSS", icon: SiTailwindcss }
    ],
    "Backend & Tools": [
      { label: "Node.js", icon: SiNodedotjs },
      { label: "MongoDB", icon: SiMongodb },
      { label: "Docker", icon: SiDocker },
      { label: "Redis", icon: SiRedis }
    ]
  };

  const accentColor = (a: string) =>
    a === 'indigo' ? 'text-indigo-500' :
    a === 'violet' ? 'text-violet-500' : 'text-emerald-500';

  const accentBg = (a: string) =>
    a === 'indigo' ? 'dark:bg-indigo-500/10 bg-indigo-50 dark:border-indigo-500/20 border-indigo-100' :
    a === 'violet' ? 'dark:bg-violet-500/10 bg-violet-50 dark:border-violet-500/20 border-violet-100' :
    'dark:bg-emerald-500/10 bg-emerald-50 dark:border-emerald-500/20 border-emerald-100';

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.developpeur} />
      <Head>
        <title>{t('nav.developer')} — Portfolio</title>
        <meta name="description" content={t('dev_page.hero_description')} />
      </Head>

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-indigo-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* ── HERO ── */}
      <section className="min-h-[92vh] flex items-center dark:bg-[#0a0a0f] bg-[#fafafc] pt-14 relative overflow-hidden">

        {/* ── Background images collage (right side) ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] dark:bg-indigo-600/6 bg-indigo-100/30 rounded-full blur-[120px]" />

          {/* Photo 1 — codage.jpg (top right, tilted) */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: 3 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="absolute hidden lg:block right-[-50px] top-[70px] w-[420px] h-[260px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border dark:border-white/[0.08] border-zinc-200/60"
          >
            <Image
              src="/images/developpeur/codage.jpg"
              alt="Code en cours"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l dark:from-[#0a0a0f]/10 from-[#fafafc]/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t dark:from-[#0a0a0f]/70 from-zinc-100/60 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Full Stack Development</span>
            </div>
          </motion.div>

          {/* Photo 2 — Trends_05_Security.jpg (bottom right, opposite tilt) */}
          <motion.div
            initial={{ opacity: 0, x: 80, rotate: -2 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="absolute hidden lg:block right-[70px] top-[300px] w-[360px] h-[220px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border dark:border-white/[0.08] border-zinc-200/60"
          >
            <Image
              src="/images/developpeur/Trends_05_Security.jpg"
              alt="Sécurité & Architecture"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l dark:from-[#0a0a0f]/5 from-[#fafafc]/5 to-transparent" />
            <div className="absolute inset-0 bg-violet-900/10" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t dark:from-[#0a0a0f]/70 from-zinc-100/60 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Sécurité & Architecture</span>
            </div>
          </motion.div>

          {/* Right edge fade so images blend into background */}
          <div className="absolute right-0 top-0 bottom-0 w-[200px] bg-gradient-to-l dark:from-[#0a0a0f] from-[#fafafc] to-transparent hidden lg:block" />
        </div>

        <div className="max-w-[1100px] mx-auto px-6 w-full relative z-10">
          <div className="max-w-[600px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 dark:bg-indigo-500/10 bg-indigo-50 dark:border-indigo-500/20 border-indigo-100 border rounded-full mb-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest">{t('dev_page.hero_subtitle')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold dark:text-white text-zinc-900 leading-[1.05] tracking-tight mb-6 text-balance"
            >
              {t('dev_page.hero_title_part1')} <span className="text-indigo-500 italic">{t('dev_page.hero_title_part2')}</span>,{' '}
              {t('dev_page.hero_title_part3')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="text-lg dark:text-zinc-500 text-zinc-500 mb-10 max-w-[560px] leading-[1.75]"
            >
              {t('dev_page.hero_description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/contact" className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                {t('dev_page.cta_expertise')}
              </Link>
              <Link href="/projects" className="h-11 px-6 dark:bg-white/[0.04] bg-white dark:hover:bg-white/[0.08] hover:bg-zinc-100 dark:text-zinc-200 text-zinc-700 dark:border-white/[0.08] border-zinc-200 border rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2">
                {t('dev_page.cta_projects')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 dark:bg-[#0a0a0f] bg-[#fafafc] border-t dark:border-white/[0.05] border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-10">{t('dev_page.services_subtitle')}</div>
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

      {/* ── STACK ── */}
      <section className="py-20 dark:bg-zinc-950 bg-zinc-900 text-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest mb-6">{t('dev_page.stack_subtitle')}</div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-6 text-balance">
                {t('dev_page.stack_title_part1')} <span className="text-indigo-400 italic">{t('dev_page.stack_title_part2')}</span>.
              </h2>
              <p className="text-zinc-400 leading-relaxed text-[15px]">
                {t('dev_page.stack_description')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(stack).map(([label, items]) => (
                <div key={label}>
                  <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-4">{label}</div>
                  <ul className="space-y-2.5">
                    {(items as { label: string; icon: React.ComponentType<{ className?: string }> }[]).map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-150">
                          <item.icon className="w-3.5 h-3.5 text-zinc-300 group-hover:text-indigo-300 transition-colors" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-200">{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJETS ── */}
      {projects.length > 0 && (
        <section className="py-20 dark:bg-[#0a0a0f] bg-[#fafafc] border-t dark:border-white/[0.05] border-zinc-100">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
              <div>
                <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-3">{t('dev_page.projects_subtitle')}</div>
                <h2 className="text-3xl font-extrabold dark:text-white text-zinc-900 tracking-tight">{t('dev_page.projects_title')}</h2>
              </div>
              <Link href="/projects" className="text-[12px] font-semibold text-indigo-500 flex items-center gap-1 hover:gap-2 transition-all duration-150">
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

      {/* ── PROCESSUS ── */}
      <section className="py-20 dark:bg-white/[0.01] bg-zinc-50 border-t dark:border-white/[0.05] border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-6">{t('dev_page.methodology_subtitle')}</div>
          <h2 className="text-3xl font-extrabold dark:text-white text-zinc-900 tracking-tight mb-12 text-balance">
            {t('dev_page.methodology_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="absolute top-5 left-0 right-0 h-px dark:bg-white/[0.05] bg-zinc-200 hidden md:block" />
            {process.map((step, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mb-5 relative z-10 shadow-lg shadow-indigo-600/20">
                  {step.n}
                </div>
                <h4 className="text-sm font-bold dark:text-white text-zinc-900 mb-2 tracking-tight">{step.t}</h4>
                <p className="text-xs dark:text-zinc-500 text-zinc-500 leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 dark:bg-gradient-to-br from-indigo-600 to-violet-700" />
        <div className="max-w-[1100px] mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-balance">
            {t('dev_page.footer_cta_title_part1')} <span className="text-indigo-200">{t('dev_page.footer_cta_title_part2')}</span> {locale === 'tr' ? t('dev_page.footer_cta_title_part3') : '?' }
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-[480px] mx-auto leading-[1.75] opacity-90">
            {t('dev_page.footer_cta_description')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="h-11 px-6 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg">
              {t('dev_page.footer_cta_btn1')}
            </Link>
            <Link href="/projects" className="h-11 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2">
              {t('dev_page.footer_cta_btn2')}
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
      category: { $in: ['web', 'api', 'library', 'tool'] },
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
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60,
    };
  } catch {
    return { 
      props: { 
        projects: [],
        ...(await serverSideTranslations(currentLocale, ['common'])),
      } 
    };
  }
};

