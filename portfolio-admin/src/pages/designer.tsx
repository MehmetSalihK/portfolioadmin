import { motion, useScroll } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import { useRef } from 'react';
import { FiFeather, FiEye, FiVideo, FiFigma, FiPlay, FiImage, FiMousePointer, FiCamera, FiExternalLink, FiGithub, FiDownload, FiSend, FiChevronRight } from 'react-icons/fi';
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

interface DesignerPageProps {
  projects: Project[];
}

export default function DesignerPage({ projects }: DesignerPageProps) {
  const { scrollYProgress } = useScroll();

  const services = [
    {
      title: "UI/UX Design & Prototypage",
      desc: "Création d'interfaces haute fidélité centrées sur l'utilisateur, optimisant chaque point de contact pour maximiser l'engagement.",
      icon: FiMousePointer,
      color: "text-rose-500",
      bg: "bg-rose-500/5"
    },
    {
      title: "Identité Visuelle & Branding",
      desc: "Développement d'un univers graphique cohérent, du logotype au système de design, pour une reconnaissance de marque instantanée.",
      icon: FiFeather,
      color: "text-amber-500",
      bg: "bg-amber-500/5"
    },
    {
      title: "Motion Design & Montage Vidéo",
      desc: "Production de contenus dynamiques premium pour raconter votre histoire et dynamiser votre communication digitale.",
      icon: FiVideo,
      color: "text-indigo-500",
      bg: "bg-indigo-500/5"
    }
  ];

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.designer} />
      <Head>
        <title>L'Artiste Digital | Designer UI/UX & Branding Premium</title>
        <meta name="description" content="Transformer l'interaction en émotion. Expert en Design UI/UX, identité visuelle et expériences immersives pour produits numériques." />
        <meta name="keywords" content="Designer UI/UX, Design Graphique, Branding, Motion Design, Figma, Framer, Frontend Design" />
      </Head>

      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-rose-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-32 pb-20 dark:bg-[#07070a] bg-zinc-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-rose-500/10 blur-[140px] rounded-full opacity-50" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-10"
            >
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Direction Artistique & Création de Contenu</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl md:text-9xl font-black dark:text-white text-zinc-900 leading-[0.85] tracking-tighter mb-10 uppercase"
            >
              Je filme et je <span className="text-rose-500 italic">monte</span>. De la captation au rendu final.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-14 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Mon approche repose sur un équilibre entre rigueur technique et une sensibilité acquise au fil de projets variés, de l’événementiel au documentaire.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Link href="/contact" className="h-20 px-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 flex items-center justify-center">
                Démarrer un projet
              </Link>
              <button className="h-20 px-12 border-2 border-zinc-200 dark:border-white/10 dark:text-white rounded-full text-[12px] font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-100 dark:hover:bg-white/5">
                Voir le Showreel
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SETUP TECHNIQUE
      ═══════════════════════════════════════ */}
      <section className="py-32 dark:bg-[#07070a] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-square rounded-[60px] overflow-hidden group">
               <Image src={projects[1]?.imageUrl || projects[0]?.imageUrl || '/hero-designer.jpg'} alt="Technical Setup" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-rose-500/20 mix-blend-overlay" />
            </div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px] mb-6 inline-block">02. Équipement & Setup</div>
              <h2 className="text-5xl font-black dark:text-white mb-10 tracking-tighter leading-none italic uppercase">Pas de compromis sur l'image</h2>
              <div className="space-y-8 text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                <p>Je travaille avec un <span className="dark:text-white text-zinc-800 font-bold">Panasonic Lumix DMC-G7</span> en 4K ou Full HD selon les besoins, complété par un <span className="dark:text-white text-zinc-800 font-bold">iPhone 13 Pro Max</span> pour les situations qui demandent plus de mobilité. Le trépied est systématique dès qu'un cadre stable est possible.</p>
                <p>Le cadrage, la lumière disponible, la composition dans l'instant — c'est ce qui se décide sur place, souvent en quelques secondes. La post-production, c'est une autre forme de travail : plus calme, plus technique, mais qui demande autant de jugement.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          EXPERIENCES (TERRAINS D'INTERVENTION)
      ═══════════════════════════════════════ */}
      <section className="py-32 border-y border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <div className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px] mb-6">03. Terrains d'intervention</div>
             <h2 className="text-6xl font-black dark:text-white tracking-tighter">Exploration de Formats</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Mariages & Événements",
                desc: "Un mariage, c'est une prise de vue qu'on ne refait pas. La gestion du stress et la réactivité sont aussi importantes que la maîtrise technique.",
                icon: FiCamera,
                color: "text-rose-500",
                bg: "bg-rose-500/5"
              },
              {
                title: "Documentaires & Vlogs",
                desc: "Un documentaire, c'est une narration construite en salle de montage à partir d'heures de rushes. Une discipline de fond qui demande autant de rigueur que de sensibilité.",
                icon: FiFeather,
                color: "text-amber-500",
                bg: "bg-amber-500/5"
              },
              {
                title: "Clips de Rap",
                desc: "Un clip, c'est un travail de direction artistique, de rythme et d'étalonnage poussé. Chaque seconde porte une intention visuelle définie en amont.",
                icon: FiPlay,
                color: "text-indigo-500",
                bg: "bg-indigo-500/5"
              }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 bg-white dark:bg-zinc-900/50 rounded-[40px] border border-zinc-200 dark:border-white/5 hover:border-rose-500/30 transition-all shadow-sm hover:shadow-xl"
              >
                <div className={`w-20 h-20 rounded-[28px] ${s.bg} ${s.color} flex items-center justify-center mb-10 border border-current opacity-80 group-hover:scale-110 transition-transform`}>
                   {/* Handle icons based on title or index */}
                   {i === 0 ? <FiFeather size={32} /> : i === 1 ? <FiVideo size={32} /> : <FiPlay size={32} />}
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-6 tracking-tight tracking-tighter lowercase italic uppercase">{s.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MAITRISE LOGICIELLE
      ═══════════════════════════════════════ */}
      <section className="py-32 overflow-hidden border-b border-zinc-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
              <div className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px]">05. Maîtrise Logicielle</div>
           </div>
           <div className="flex flex-wrap justify-between items-center gap-12 opacity-80 group hover:grayscale-0 transition-all duration-700">
              <div className="text-3xl font-black italic tracking-tighter hover:text-rose-500 transition-colors pointer-events-none">PREMIERE PRO</div>
              <div className="text-3xl font-black italic tracking-tighter hover:text-rose-500 transition-colors pointer-events-none">AFTER EFFECTS</div>
              <div className="text-3xl font-black italic tracking-tighter hover:text-rose-500 transition-colors pointer-events-none">PHOTOSHOP</div>
              <div className="text-3xl font-black italic tracking-tighter hover:text-rose-500 transition-colors pointer-events-none">LIGHTROOM</div>
              <div className="text-3xl font-black italic tracking-tighter hover:text-rose-500 transition-colors pointer-events-none">MEDIA ENCODER</div>
           </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROJECTS PROOF
      ═══════════════════════════════════════ */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-7xl font-black dark:text-white tracking-tighter mb-4 uppercase italic">Réalisations Récentes</h2>
             <div className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px]">Portfolio Visuel & Vidéo</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {projects.map((p, i) => (
              <motion.div 
                key={p._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`group relative ${i % 2 === 1 ? 'md:mt-24' : ''}`}
              >
                <div className="relative aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl border border-white/5">
                   <Image src={p.imageUrl} alt={p.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <div className="absolute inset-0 flex flex-col justify-end p-12 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <h3 className="text-4xl font-black text-white mb-6 leading-none italic uppercase tracking-tighter">{p.title}</h3>
                      <div className="flex gap-4">
                        <span className="h-14 px-8 bg-white text-black rounded-full flex items-center justify-center font-black text-[10px] uppercase tracking-widest cursor-pointer">Voir le projet</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROCESS (WORKFLOW)
      ═══════════════════════════════════════ */}
      <section className="py-32 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px] mb-12 text-center">04. Workflow de Production</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
             {[
               { t: "Cadrage & Composition", d: "Recherche du meilleur angle et gestion de la lumière au tournage pour un rendu cinématographique." },
               { t: "Montage Narratif", d: "Construction d'un récit fluide et percutant, orchestrant le rythme et l'intention." },
               { t: "Étalonnage Premium", d: "Travail de la colorimétrie pour donner une identité visuelle propre et cohérente à chaque projet." },
               { t: "Optimisation & Export", d: "Encodage spécifique adapté aux contraintes de chaque plateforme (YouTube, Instagram, Web)." },
             ].map((step, i) => (
               <div key={i} className="relative">
                  <div className="text-5xl font-black text-rose-500/10 mb-8 font-serif">{i + 1}.</div>
                  <h4 className="text-xl font-black dark:text-white mb-4 tracking-tighter uppercase">{step.t}</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{step.d}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          YOUTUBER / CREATOR STORY
      ═══════════════════════════════════════ */}
      <section className="py-32 bg-rose-500 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                  <div className="text-white/60 uppercase tracking-[0.3em] font-black text-[10px] mb-8">06. Culture du contenu</div>
                  <h2 className="text-7xl font-black mb-10 tracking-tighter leading-none italic uppercase">De l'autre côté de l'écran</h2>
                  <div className="space-y-8 text-xl text-rose-50/90 leading-relaxed font-medium">
                    <p>Mon expérience passée en tant que créateur sur <span className="text-white font-black">YouTube</span> et mes sessions en direct sur <span className="text-white font-black">Twitch & Kick</span> m'ont apporté une compréhension directe des codes de l'audience.</p>
                    <p>Cette double casquette de technicien et de créateur me permet d'anticiper les besoins réels d'un projet de contenu et d'optimiser chaque seconde de vidéo.</p>
                  </div>
              </motion.div>
              <div className="relative aspect-video rounded-[40px] overflow-hidden bg-rose-600 flex items-center justify-center border-8 border-white/10">
                  <div className="text-5xl font-black italic rotate-12 opacity-20">LIVE STREAMING</div>
                  <FiPlay size={80} className="absolute text-white/40" />
              </div>
           </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="py-40 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
           <div className="text-zinc-500 uppercase tracking-[0.3em] font-black text-[10px] mb-12">07. Positionnement Final</div>
           <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.85] uppercase italic">Fixer l'instant, orchestrer le <span className="text-rose-500">mouvement</span>.</h2>
           <p className="text-xl md:text-2xl text-zinc-400 mb-16 max-w-2xl mx-auto font-medium">Livrons ensemble un rendu qui tient ses promesses techniques autant qu'esthétiques.</p>
           <div className="flex flex-wrap justify-center gap-8">
              <Link href="/contact" className="h-24 px-16 bg-rose-500 text-white rounded-full text-[14px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center">
                Solliciter une expertise
              </Link>
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
      category: { $in: ['web', 'mobile', 'other'] },
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
    return { props: { projects: [] } };
  }
};
