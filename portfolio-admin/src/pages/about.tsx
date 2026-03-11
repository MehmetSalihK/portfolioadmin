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

      {/* Ambient blobs — only visible in dark mode */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 dark:opacity-100 opacity-0 transition-opacity duration-300">
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-violet-600/6 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-8 h-[1px] bg-indigo-500" />
            Profil
          </div>
          <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">
            À Propos
          </h1>
          <p className="dark:text-zinc-400 text-zinc-600 text-lg font-medium max-w-xl">
            Mon parcours, mes compétences et ce qui me passionne dans le développement web.
          </p>
        </motion.div>

        {/* Profile + Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Profile photo */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="relative aspect-square max-w-sm rounded-3xl overflow-hidden dark:border-white/10 border-zinc-200 border shadow-2xl dark:bg-zinc-900 bg-zinc-100">
              {settings.aboutImage ? (
                <Image src={settings.aboutImage} alt="Profile" fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full dark:bg-zinc-800 bg-zinc-200 dark:border-white/10 border-zinc-300 border flex items-center justify-center">
                    <FaUser className="w-10 h-10 dark:text-zinc-700 text-zinc-400" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 rounded-3xl ring-1 dark:ring-indigo-500/20 ring-indigo-300/40 pointer-events-none" />
            </div>
          </motion.div>

          {/* Bio card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex flex-col justify-center">
            <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl dark:border-white/5 border-zinc-200 border p-8 shadow-sm">
              <h2 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight mb-6">
                {settings.aboutTitle || 'Mon Parcours'}
              </h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-base leading-relaxed dark:text-zinc-300 text-zinc-600 [&_p]:mb-4 [&_strong]:dark:text-white [&_strong]:text-zinc-900">
                {settings.aboutBio ? (
                  parse(DOMPurify.sanitize(settings.aboutBio))
                ) : (
                  <p>Bonjour ! Je suis un développeur Full Stack basé en France, passionné par la création d&apos;applications web modernes et performantes.</p>
                )}
              </div>
              <div className="mt-8 pt-6 dark:border-white/5 border-zinc-200 border-t">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  Me contacter
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em] mb-8">
            <span className="w-8 h-[1px] bg-indigo-500" />
            Domaines d&apos;expertise
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl dark:border-white/5 border-zinc-200 border p-7 dark:hover:border-indigo-500/30 hover:border-indigo-400 transition-all shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${feature.accentCls}`}>
                  {feature.icon}
                </div>
                <h3 className="dark:text-white text-zinc-900 font-bold tracking-tight mb-3">{feature.title}</h3>
                <p className="dark:text-zinc-400 text-zinc-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}
