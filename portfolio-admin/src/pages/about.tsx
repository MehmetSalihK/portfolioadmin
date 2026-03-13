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

      {/* Ambient background effects synced with Design Strategy */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] dark:bg-indigo-600/10 bg-indigo-50/50 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] dark:bg-violet-600/8 bg-violet-50/40 rounded-full blur-[120px] opacity-70" />
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32">
        {/* HERO: The Hybrid Identity */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="lg:col-span-7"
            >
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
                <span className="w-10 h-[1px] bg-indigo-500" />
                The Digital Craftsman
              </div>
              <h1 className="text-5xl lg:text-7xl font-black dark:text-white text-zinc-900 leading-[1.05] tracking-tight mb-8">
                Codeur par <span className="text-indigo-600 dark:text-indigo-500">métier</span>,<br />
                Créatif par <span className="dark:text-zinc-600 text-zinc-400">nature</span>.
              </h1>
              <p className="text-xl dark:text-zinc-400 text-zinc-600 font-medium max-w-xl leading-relaxed">
                Je fusionne la rigueur de l'architecture logicielle avec une sensibilité esthétique aiguë pour créer des expériences numériques qui marquent les esprits.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }} 
              animate={{ opacity: 1, scale: 1, rotate: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden dark:bg-zinc-900 bg-zinc-100 dark:border-white/5 border-zinc-200 border-2 shadow-2xl group">
                {settings.aboutImage && settings.aboutImage.trim() !== '' ? (
                  <Image src={settings.aboutImage} alt="Profile" fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="500px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-32 h-32 rounded-3xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center">
                       <FaUser className="w-12 h-12 text-indigo-500" />
                     </div>
                  </div>
                )}
                {/* Visual Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 px-3 py-1 rounded-full">Disponibilité : Immédiate</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE TRINITY GRID: Multidisciplinary Storytelling */}
        <section className="mb-32">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-12">
            <span className="w-10 h-[1px] bg-indigo-500" />
            L'Intersection
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Development (The Architect) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[2.5rem] p-10 dark:border-white/5 border-zinc-200 border group hover:border-indigo-500/20 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8 border dark:border-indigo-500/20 border-indigo-100">
                  <FaCode className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">L'Architecte</h3>
                <p className="dark:text-zinc-500 text-zinc-600 text-sm leading-relaxed mb-6">
                  Expertise complète sur la stack <span className="dark:text-white text-zinc-900 font-bold">MERN & Next.js</span>. Je conçois des systèmes performants,
                  évolutifs et pensés pour l'utilisateur final.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'React', 'Node.js', 'MongoDB'].map(t => (
                  <span key={t} className="px-3 py-1 dark:bg-white/5 bg-zinc-50 dark:text-zinc-500 text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">{t}</span>
                ))}
              </div>
            </motion.div>

            {/* Column 2: Creative (The Artist) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="dark:bg-[#0d0d14] bg-zinc-900 rounded-[2.5rem] p-10 border-white/5 border group hover:scale-[1.02] transition-all duration-500 text-white relative overflow-hidden"
            >
              {/* Subtle creative pulse animation background element can go here */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-8 border border-violet-500/30">
                    <FaVideo className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-4 text-white">L'Artiste</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    Monteur vidéo et designer UI. Je crois que l'esthétique n'est pas optionnelle, c'est un langage qui renforce <span className="text-white font-bold">l'impact du message</span>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                   {['Premiere Pro', 'After Effects', 'Framer', 'UI/UX'].map(t => (
                    <span key={t} className="px-3 py-1 bg-white/5 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Column 3: Hardware (The Maker) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[2.5rem] p-10 dark:border-white/5 border-zinc-200 border group hover:border-emerald-500/20 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border dark:border-emerald-500/20 border-emerald-100">
                  <FaTools className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">Le Maker</h3>
                <p className="dark:text-zinc-500 text-zinc-600 text-sm leading-relaxed mb-6">
                  Maîtrise du matériel. De la microsoudure à la maintenance logicielle système. Je comprends les <span className="dark:text-white text-zinc-900 font-bold">atomes</span> aussi bien que les bits.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                 {['Microsoudure', 'PC Building', 'Diagnosis', 'IoT'].map(t => (
                  <span key={t} className="px-3 py-1 dark:bg-white/5 bg-zinc-50 dark:text-zinc-500 text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">{t}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* BIO: The Narrative */}
        <section className="mb-32">
          <div className="dark:bg-zinc-900/40 bg-zinc-50/50 backdrop-blur-sm rounded-[3rem] p-12 md:p-20 dark:border-white/5 border-zinc-200 border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 dark:bg-indigo-500/5 bg-indigo-50/30 rounded-full blur-3xl" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
              <div className="lg:col-span-4">
                <h2 className="text-3xl font-black dark:text-white text-zinc-900 tracking-tight mb-6">
                  {settings.aboutTitle || 'Ma Philosophie'}
                </h2>
                <div className="h-1 w-20 bg-indigo-600 rounded-full mb-8" />
              </div>
              <div className="lg:col-span-8">
                <div className="dark:text-zinc-400 text-zinc-600 text-lg md:text-xl leading-relaxed font-medium space-y-6">
                  {settings.aboutBio ? (
                    parse(DOMPurify.sanitize(settings.aboutBio))
                  ) : (
                    <p>Passionné par l'innovation technique et la créativité visuelle, j'évolue dans l'univers du numérique avec une approche holistique.</p>
                  )}
                </div>
                <div className="mt-12 flex flex-wrap gap-6 items-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
                  >
                    Lançons un projet
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                   <Link
                    href="/projects"
                    className="text-indigo-500 hover:text-indigo-400 font-black text-xs uppercase tracking-widest border-b-2 border-indigo-500/20 hover:border-indigo-500 transition-all pb-1"
                  >
                    Explorer mes travaux
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60,
  };
};
