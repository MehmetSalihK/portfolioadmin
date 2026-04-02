import { motion, useScroll } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import { useRef } from 'react';
import { FiCpu, FiTool, FiZap, FiSettings, FiActivity, FiSearch, FiAnchor, FiExternalLink, FiGithub, FiDownload, FiSend, FiChevronRight } from 'react-icons/fi';
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

interface MakerPageProps {
  projects: Project[];
}

export default function MakerPage({ projects }: MakerPageProps) {
  const { scrollYProgress } = useScroll();

  const services = [
    {
      title: "DÃ©veloppement de SystÃ¨mes EmbarquÃ©s (IoT)",
      desc: "Conception de solutions connectÃ©es de bout en bout, de la sÃ©lection des composants au dÃ©ploiement du firmware sÃ©curisÃ©.",
      icon: FiCpu,
      color: "text-amber-500",
      bg: "bg-amber-500/5"
    },
    {
      title: "Diagnostic & Troubleshooting AvancÃ©",
      desc: "Analyse et rÃ©paration de dÃ©faillances critiques sur des parcs hardware ou des Ã©quipements Ã©lectroniques spÃ©cialisÃ©s.",
      icon: FiActivity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/5"
    },
    {
      title: "Prototypage Rapide & Ã‰lectronique",
      desc: "CrÃ©ation de preuves de concept hardware, conception de circuits imprimÃ©s (PCB) et intÃ©gration de capteurs intelligents.",
      icon: FiTool,
      color: "text-blue-500",
      bg: "bg-blue-500/5"
    }
  ];

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.maker} />
      <Head>
        <title>Le Builder | IngÃ©nierie Hardware & SystÃ¨mes IoT</title>
        <meta name="description" content="Domptez la matiÃ¨re par le code. Expert en systÃ¨mes embarquÃ©s, IoT, diagnostic Ã©lectronique et prototypage hardware industriel." />
        <meta name="keywords" content="IngÃ©nieur Hardware, IoT, SystÃ¨mes embarquÃ©s, Arduino, ESP32, Electronique, Prototypage, Troubleshooting" />
      </Head>

      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-amber-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO SECTION
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden pt-32 pb-20 dark:bg-[#08080a] bg-zinc-100">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-amber-500/10 blur-[140px] rounded-full opacity-30" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -ml-48 -mb-48 opacity-20" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] dark:opacity-20 opacity-50 bg-center" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                      <FiCpu size={24} />
                   </div>
                   <span className="text-[10px] font-black dark:text-zinc-400 text-zinc-500 uppercase tracking-[0.4em]">Hardware & Embedded Division</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black dark:text-white text-zinc-900 leading-[0.9] tracking-tighter mb-10 uppercase">
                  Je comprends la technologie dans ses deux <span className="text-amber-500 italic">dimensions</span>.
                </h1>

                <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-14 max-w-xl leading-relaxed font-medium">
                  Le logiciel et le matÃ©riel. LÃ  oÃ¹ beaucoup sÃ©parent les deux, je les vois comme une seule rÃ©alitÃ©. Un appareil qui ne fonctionne plus est un problÃ¨me Ã  diagnostiquer mÃ©thodiquement â€” pas Ã  remplacer par dÃ©faut.
                </p>

                <div className="flex flex-wrap gap-5">
                   <Link href="/contact" className="h-16 px-10 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center gap-3">
                     Propulser mon projet IoT
                   </Link>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 1, delay: 0.2 }}
                className="hidden lg:block relative"
              >
                 <div className="relative aspect-square max-w-md mx-auto">
                    <div className="absolute inset-0 bg-amber-500/10 animate-pulse rounded-[80px]" />
                    <div className="absolute inset-8 border-2 border-dashed border-amber-500/20 rounded-[60px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <FiSettings className="w-40 h-40 text-amber-500/20 animate-spin-slow" />
                    </div>
                    {/* Floating nodes */}
                    <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-0 right-10 p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-2xl">
                       <FiZap className="text-amber-500 w-8 h-8" />
                    </motion.div>
                    <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-20 left-0 p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-2xl">
                       <FiSearch className="text-emerald-500 w-8 h-8" />
                    </motion.div>
                 </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SERVICES & VISION
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-32 dark:bg-[#07070a] bg-zinc-50 border-y border-zinc-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <h2 className="text-5xl font-black dark:text-white mb-10 tracking-tighter italic uppercase">Diagnostiquer avant de remplacer</h2>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Je ne cherche pas Ã  remplacer ce qui peut Ãªtre rÃ©parÃ©. Je cherche d'abord Ã  comprendre pourquoi Ã§a ne fonctionne plus. Ce rÃ©flexe de diagnostic, que ce soit face Ã  un bug logiciel ou Ã  un composant matÃ©riel, c'est ce qui fait la diffÃ©rence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "RÃ©paration & Maintenance",
                desc: "PC fixe, laptop, smartphone, tablette â€” formatage, suppression de virus, rÃ©cupÃ©ration de donnÃ©es perdues, rÃ©installation systÃ¨me. Du travail mÃ©thodique, sans prÃ©cipitation.",
                icon: FiCpu
              },
              {
                title: "Construction & Assemblage PC",
                desc: "Choix de la carte mÃ¨re, du processeur, de la RAM, compatibilitÃ© des composants, assemblage et mise en service. Une configuration pensÃ©e pour durer, pas pour paraÃ®tre.",
                icon: FiTool
              },
              {
                title: "RÃ©paration Smartphone",
                desc: "Batterie, Ã©cran, microphone, module camÃ©ra â€” ce type d'intervention demande Ã  la fois une connaissance du matÃ©riel et une rigueur dans l'exÃ©cution. La marge d'erreur est faible.",
                icon: FiActivity
              }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 bg-white dark:bg-zinc-900/40 rounded-[40px] border border-zinc-200 dark:border-white/5 hover:border-amber-500/30 transition-all shadow-sm hover:shadow-xl"
              >
                <div className="w-20 h-20 rounded-[28px] bg-amber-500/10 text-amber-500 flex items-center justify-center mb-10 border border-amber-500/20 group-hover:rotate-12 transition-transform mx-auto">
                   <s.icon size={32} />
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-6 uppercase italic tracking-tighter">{s.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          ENVIRONNEMENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-32 dark:bg-[#0b0b12] bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="p-16 rounded-[60px] bg-zinc-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 blur-[100px] -mr-48 -mt-48" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
                 <div>
                    <h2 className="text-5xl font-black italic tracking-tighter mb-8 uppercase leading-none">Plateformes maîtrisées.</h2>
                    <p className="text-zinc-400 text-lg mb-8 max-w-sm">Ma double maîtrise du logiciel et du hardware me permet de traiter des problèmes complexes que ni un développeur pur ni un technicien de surface ne résoudrait seul. C’est cet écart que j’occupe.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-10">
                    <div>
                       <h4 className="text-amber-500 font-extrabold text-[10px] uppercase tracking-widest mb-6">ContrÃ´leurs</h4>
                       <ul className="space-y-3 font-bold text-lg dark:text-zinc-200">
                          <li>Arduino / ESP32</li>
                          <li>STM32 / AVR</li>
                          <li>Raspberry Pi / Jetson</li>
                       </ul>
                    </div>
                    <div>
                       <h4 className="text-amber-500 font-extrabold text-[10px] uppercase tracking-widest mb-6">Protocoles</h4>
                       <ul className="space-y-3 font-bold text-lg dark:text-zinc-200">
                          <li>MQTT / HTTP</li>
                          <li>LoRa / ESP-NOW</li>
                          <li>BLE / Zigbee</li>
                       </ul>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PROJECTS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-24 gap-6 text-center md:text-left">
             <div className="space-y-2">
                <h2 className="text-6xl font-black dark:text-white tracking-tighter uppercase leading-none italic">Preuves du Builder.</h2>
                <div className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Hardware & Automation Results</div>
             </div>
             <Link href="/projects" className="text-[11px] font-black uppercase tracking-widest text-amber-500 border-b-2 border-amber-500/20 hover:border-amber-500 transition-all py-1">
                Explorer tous les hacks
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {projects.map((p, i) => (
                <motion.div 
                  key={p._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="group bg-zinc-100 dark:bg-white/5 rounded-[40px] overflow-hidden border border-zinc-200 dark:border-white/5"
                >
                   <div className="relative aspect-video">
                      <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-amber-500/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="p-10">
                      <h3 className="text-2xl font-black dark:text-white mb-4 tracking-tight leading-none uppercase italic">{p.title}</h3>
                      <p className="text-zinc-500 text-sm line-clamp-3 mb-8">{p.description}</p>
                      <div className="flex gap-4">
                         <a href={p.demoUrl} className="flex-1 h-12 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest">Voir le projet</a>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PROCESS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-32 border-t border-zinc-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { t: "Expertise Terrain", d: "Analyse physique et logicielle de l'existant ou du besoin spÃ©cifique." },
                { t: "Architecture Hardware", d: "SÃ©lection rigoureuse des composants stratÃ©giques (fiabilitÃ©/coÃ»t)." },
                { t: "Prototypage", d: "Codage du firmware et tests sur banc d'essai haute prÃ©cision." },
                { t: "Certification", d: "Mise Ã  l'Ã©preuve du systÃ¨me en conditions rÃ©elles et validation finale." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                   <div className="w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center text-xl font-black dark:text-white mb-8">{i + 1}</div>
                   <h4 className="text-xl font-black dark:text-white mb-4 tracking-tight leading-none italic uppercase">{step.t}</h4>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[200px]">{step.d}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FINAL CTA
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-40 bg-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center text-white">
           <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-12 uppercase leading-[0.85]">Confiez-moi vos dÃ©fis les plus <span className="text-zinc-900">complexes</span>.</h2>
           <p className="text-xl md:text-2xl text-amber-100 mb-16 max-w-2xl mx-auto font-medium">SpÃ©cialiste du troubleshooting Ã©lectronique et du scale IoT industriel.</p>
           <div className="flex flex-wrap justify-center gap-8">
              <Link href="/contact" className="h-24 px-16 bg-white text-amber-600 rounded-3xl text-[14px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center">
                DÃ©marrer le diagnostic
              </Link>
              <button className="h-24 px-16 bg-zinc-900 text-white rounded-3xl text-[14px] font-black uppercase tracking-[0.3em] transition-all hover:bg-black flex items-center justify-center gap-3">
                <FiDownload /> Guide Hardware
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
      category: { $in: ['desktop', 'tool', 'mobile'] },
      archived: { $ne: true }
    })
    .sort({ featured: -1, order: 1 })
    .limit(3)
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


