import { motion, useScroll, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import { useRef, useState } from 'react';
import { FiCode, FiCpu, FiArchive, FiShield, FiZap, FiSearch, FiLayers, FiDatabase, FiExternalLink, FiGithub, FiDownload, FiSend, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

import JSONLD, { schemas } from '@/components/layout/JSONLD';

interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  category?: string;
}

interface DeveloppeurPageProps {
  projects: Project[];
}

export default function DeveloppeurPage({ projects }: DeveloppeurPageProps) {
  const { scrollYProgress } = useScroll();
  const mainRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      title: "Architecture Full Stack & Micro-services",
      desc: "Développement de solutions complètes avec React et Next.js, propulsées par des backends Node.js robustes et une gestion de données optimisée sous MongoDB.",
      icon: FiLayers,
      color: "text-indigo-500",
      bg: "bg-indigo-500/5"
    },
    {
      title: "Ingénierie d'API & Intégrations",
      desc: "Conception d'interfaces de programmation performantes et sécurisées pour une interopérabilité fluide entre vos outils et services tiers.",
      icon: FiCpu,
      color: "text-violet-500",
      bg: "bg-violet-500/5"
    },
    {
      title: "Optimisation de Performance & SEO",
      desc: "Audit et restructuration technique pour atteindre des scores Core Web Vitals parfaits et une visibilité maximale sur les moteurs de recherche.",
      icon: FiZap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/5"
    }
  ];

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.developpeur} />
      <Head>
        <title>L'Architecte Digital | Expert Full Stack Développement</title>
        <meta name="description" content="Concevez des écosystèmes numériques qui redéfinissent la performance. Expert Next.js, Node.js et architectures scalables pour Startups." />
        <meta name="keywords" content="Développeur Next.js, Full Stack, Node.js, MongoDB, Performance Web, Architecture Clean, SEO Technique, Startup Tech" />
      </Head>

      {/* Scroll progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-indigo-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-32 pb-20 dark:bg-[#07070a] bg-zinc-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/10 blur-[140px] rounded-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 blur-[120px] rounded-full -ml-40 -mb-40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-10"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Division Ingénierie & Architecture Logicielle</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl md:text-9xl font-black dark:text-white text-zinc-900 leading-[0.85] tracking-tighter mb-10 uppercase"
            >
              Je construis des <span className="text-indigo-500 italic">systèmes</span>, pas des pages.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-14 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              Des architectures complètes qui fonctionnent, qui tiennent dans le temps et qui peuvent évoluer sans être refondues de zéro six mois après.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Link href="/contact" className="h-20 px-12 bg-indigo-600 text-white rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 flex items-center justify-center">
                Solliciter une expertise
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES & VISION
      ═══════════════════════════════════════ */}
      <section className="py-32 dark:bg-[#07070a] bg-white border-y border-zinc-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                title: "Architecture Full Stack MERN",
                desc: "MongoDB, Express, React, Node.js — et Next.js pour le rendu. C'est l'environnement dans lequel je suis le plus à l'aise, mais je ne m'y suis pas enfermé. Le langage ou le framework n'est jamais le problème.",
                icon: FiLayers
              },
              {
                title: "Serveurs & Systèmes Automatisés",
                desc: "Configuration d'un VPS, mise en place d'un environnement Linux, automatisation de tâches système — c'est une partie entière de mon travail, pas une option. Je travaille sur Linux, macOS et Windows sans friction.",
                icon: FiCpu
              },
              {
                title: "IA & Optimisation Workflow",
                desc: "J'utilise l'intelligence artificielle comme levier d'efficacité, pas comme béquille. Savoir rédiger un prompt précis, interpréter une sortie de modèle, intégrer ces outils dans un workflow de développement — c'est une compétence à part entière.",
                icon: FiZap
              }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 bg-zinc-50 dark:bg-zinc-900/40 rounded-[40px] border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-xl"
              >
                <div className="w-20 h-20 rounded-[28px] bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-10 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                   <s.icon size={32} />
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-6 uppercase italic tracking-tighter">{s.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STACK
      ═══════════════════════════════════════ */}
      <section className="py-32 bg-zinc-900 dark:bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-end mb-20">
            <div className="lg:w-1/2">
              <h2 className="text-5xl font-black tracking-tighter mb-8 leading-none italic uppercase">L'Arsenal Technologique.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">Mes projets personnels constituent l'essentiel de ma pratique. J'ai appris en construisant des choses réelles, en les cassant, en les reconstruisant — un cycle répété sur plusieurs projets, tous disponibles sur GitHub.</p>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4">Core Stack</h4>
                <ul className="space-y-2 text-xl font-bold">
                  <li>Next.js & React</li>
                  <li>Node.js / Express</li>
                  <li>TypeScript</li>
                  <li>MongoDB</li>
                </ul>
              </div>
              <div>
                <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4">Ecosystem</h4>
                <ul className="space-y-2 text-xl font-bold">
                  <li>Tailwind CSS</li>
                  <li>Framer Motion</li>
                  <li>Docker / VPS</li>
                  <li>Redis / Caching</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROJECTS PROOF
      ═══════════════════════════════════════ */}
      <section className="py-32 dark:bg-[#09090f] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-20">
            <div>
              <h2 className="text-4xl font-black dark:text-white tracking-tighter uppercase mb-2">Réalisations Techniques</h2>
              <div className="text-zinc-500 font-medium">Preuves d'architectures scalables et robustes.</div>
            </div>
            <Link href="/projects" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2 group">
              Voir tout <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((p, i) => (
              <motion.div 
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-[500px] rounded-[48px] overflow-hidden border border-zinc-100 dark:border-white/5 shadow-lg"
              >
                <Image src={p.imageUrl} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12 flex flex-col justify-end">
                   <div className="flex gap-2 mb-4">
                     {p.technologies.slice(0, 3).map((t, idx) => (
                       <span key={idx} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-white tracking-widest">{t}</span>
                     ))}
                   </div>
                   <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{p.title}</h3>
                   <p className="text-zinc-300 text-sm line-clamp-2 mb-8 max-w-md">{p.description}</p>
                   <div className="flex gap-4">
                     {p.demoUrl && <a href={p.demoUrl} target="_blank" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-xl transition-transform hover:scale-110 active:scale-95"><FiExternalLink /></a>}
                     {p.githubUrl && <a href={p.githubUrl} target="_blank" className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"><FiGithub /></a>}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROCESS
      ═══════════════════════════════════════ */}
      <section className="py-32 bg-zinc-50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter">Méthodologie Architecte</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
             <div className="absolute top-24 left-0 right-0 h-px bg-zinc-200 dark:bg-white/10 hidden md:block" />
             {[
               { t: "01. Diagnostic", d: "Audit des besoins métier et définition de la stack technologique idéale." },
               { t: "02. Schéma", d: "Modélisation de la base de données et des flux logiques avant codage." },
               { t: "03. Sprint", d: "Développement itératif avec déploiement continu et tests automatisés." },
               { t: "04. Monitoring", d: "Mise en production sécurisée et surveillance active des performances." },
             ].map((step, i) => (
               <div key={i} className="relative pt-12 md:pt-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black mb-8 relative z-10 shadow-lg shadow-indigo-500/20">
                    {i + 1}
                  </div>
                  <h4 className="text-lg font-black dark:text-white mb-4 tracking-tight">{step.t}</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.d}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="py-40 relative overflow-hidden dark:bg-[#09090f]">
        <div className="absolute inset-0 bg-indigo-600">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 to-violet-700" />
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center text-white">
           <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-none">Besoin d'une infrastructure sans <span className="text-indigo-200">compromis</span> ?</h2>
           <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium opacity-90">Discutons de vos enjeux techniques et bâtissons ensemble votre prochain avantage concurrentiel.</p>
           <div className="flex flex-wrap justify-center gap-6">
              <Link href="/contact" className="h-20 px-12 bg-white text-indigo-600 rounded-[28px] text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center">
                Analyser mon projet
              </Link>
              <button className="h-20 px-12 bg-transparent border-2 border-white/30 hover:border-white text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                <FiDownload /> Lead Magnet : Anti-Dette
              </button>
           </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    await connectDB();
    const projects = await ProjectModel.find({
      category: { $in: ['web', 'api', 'library', 'tool'] },
      archived: { $ne: true }
    })
    .sort({ featured: -1, order: 1 })
    .limit(4)
    .lean();

    return {
      props: {
        projects: JSON.parse(JSON.stringify(projects)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { props: { projects: [] } };
  }
};
