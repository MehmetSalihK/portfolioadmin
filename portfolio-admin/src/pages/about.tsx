import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { FaUser, FaCode, FaVideo, FaTools } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import parse from 'html-react-parser';
import Link from 'next/link';
import { GetStaticProps } from 'next';

interface AboutSettings {
  aboutTitle?: string;
  aboutBio?: string;
  aboutImage?: string;
  siteTitle?: string;
}

const features = [
  {
    icon: <FaCode className="w-5 h-5" />,
    title: 'Développement Web',
    desc: 'Expertise complète sur la stack MERN & Next.js. De la conception UI Frontend à l\'architecture API Backend et la gestion de bases de données.',
    accentCls: 'dark:bg-indigo-500/10 bg-indigo-50 dark:border-indigo-500/20 border-indigo-200 dark:text-indigo-400 text-indigo-600',
  },
  {
    icon: <FaVideo className="w-5 h-5" />,
    title: 'Vidéo & Design',
    desc: 'Création de contenu multimédia impactant : montage vidéo (Premiere Pro, After Effects) et conception graphique de supports visuels.',
    accentCls: 'dark:bg-violet-500/10 bg-violet-50 dark:border-violet-500/20 border-violet-200 dark:text-violet-400 text-violet-600',
  },
  {
    icon: <FaTools className="w-5 h-5" />,
    title: 'Hardware & Maintenance',
    desc: 'Support technique polyvalent : diagnostic, réparation de smartphones et maintenance/montage de matériel informatique.',
    accentCls: 'dark:bg-emerald-500/10 bg-emerald-50 dark:border-emerald-500/20 border-emerald-200 dark:text-emerald-400 text-emerald-600',
  },
];

export default function About() {
  const [settings, setSettings] = useState<AboutSettings>({
    aboutTitle: 'Mon Parcours',
    aboutBio: '',
    aboutImage: '',
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <Head>
        <title>{settings.siteTitle ? `À Propos — ${settings.siteTitle}` : 'À Propos — Portfolio'}</title>
        <meta name="description" content="En savoir plus sur mon parcours et mes compétences" />
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
              À propos
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold dark:text-white text-zinc-900 leading-[1.1] tracking-tight mb-6 text-balance">
              Codeur par <span className="text-indigo-500 italic">métier</span>,{' '}
              créatif par <span className="text-indigo-500 italic">nature</span>.
            </h1>
            <p className="text-lg dark:text-zinc-500 text-zinc-500 max-w-[560px] leading-[1.75] font-normal">
              Je fusionne la rigueur de l&apos;architecture logicielle avec une sensibilité esthétique pour créer des expériences numériques complètes.
            </p>
          </motion.div>
        </section>


        {/* LES 3 IDENTITÉS */}
        <section className="mb-20">
          <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-8">Les 3 expertises</div>
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
                <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight mb-4">
                  {settings.aboutTitle || 'Ma philosophie'}
                </h2>
                <div className="w-8 h-0.5 bg-indigo-500 rounded-full" />
              </div>
              <div className="lg:col-span-8">
                <div className="dark:text-zinc-400 text-zinc-600 text-base leading-[1.8] space-y-4">
                  {settings.aboutBio ? (
                    parse(DOMPurify.sanitize(settings.aboutBio))
                  ) : (
                    <p>Passionné par l&apos;innovation technique et la créativité visuelle, j&apos;évolue dans l&apos;univers du numérique avec une approche holistique.</p>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <Link
                    href="/contact"
                    className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    Lançons un projet
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/projects"
                    className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors duration-150 flex items-center gap-1"
                  >
                    Explorer mes travaux →
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

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60,
  };
};
