import { motion, useScroll } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import {
  FiFeather, FiVideo, FiPlay, FiMousePointer,
  FiExternalLink, FiGithub, FiChevronRight
} from 'react-icons/fi';
import {
  SiAdobepremierepro, SiAdobeaftereffects, SiAdobephotoshop,
  SiAdobelightroom, SiAdobecreativecloud
} from 'react-icons/si';
import Image from 'next/image';
import Link from 'next/link';
import JSONLD, { schemas } from '@/components/layout/JSONLD';

interface Project {
  _id: string; title: string; description: string;
  imageUrl: string; technologies: string[];
  demoUrl?: string; githubUrl?: string; category?: string;
}

interface DesignerPageProps { projects: Project[]; }

const services = [
  {
    title: "UI/UX Design & Prototypage",
    desc: "Interfaces haute fidélité centrées sur l'utilisateur, optimisant chaque point de contact pour maximiser l'engagement.",
    icon: FiMousePointer, accent: 'rose'
  },
  {
    title: "Motion Design & Montage Vidéo",
    desc: "Production de contenus dynamiques premium pour raconter votre histoire et dynamiser votre communication digitale.",
    icon: FiVideo, accent: 'amber'
  },
  {
    title: "Direction Artistique & Branding",
    desc: "Univers graphique cohérent, du logotype au système de design, pour une reconnaissance de marque instantanée.",
    icon: FiFeather, accent: 'indigo'
  }
];

const formats = [
  { title: "Mariages & Événements", desc: "Un mariage, c'est une prise de vue qu'on ne refait pas. La réactivité et la maîtrise technique sont indissociables.", icon: FiFeather, accent: 'rose' },
  { title: "Documentaires & Vlogs", desc: "Un documentaire, c'est une narration construite en salle de montage à partir d'heures de rushes. Rigueur et sensibilité.", icon: FiVideo, accent: 'amber' },
  { title: "Clips de Rap", desc: "Un clip, c'est un travail de direction artistique, de rythme et d'étalonnage. Chaque seconde porte une intention visuelle.", icon: FiPlay, accent: 'indigo' },
];

const workflow = [
  { t: "Cadrage & Composition", d: "Recherche du meilleur angle et gestion de la lumière pour un rendu cinématographique." },
  { t: "Montage Narratif", d: "Construction d'un récit fluide et percutant, orchestrant le rythme et l'intention." },
  { t: "Étalonnage Premium", d: "Colorimétrie pour donner une identité visuelle propre et cohérente à chaque projet." },
  { t: "Optimisation & Export", d: "Encodage adapté aux contraintes de chaque plateforme (YouTube, Instagram, Web)." },
];

const logiciels = [
  { label: 'Premiere Pro', icon: SiAdobepremierepro, color: '#9999FF' },
  { label: 'After Effects', icon: SiAdobeaftereffects, color: '#9999FF' },
  { label: 'Photoshop', icon: SiAdobephotoshop, color: '#31A8FF' },
  { label: 'Lightroom', icon: SiAdobelightroom, color: '#31A8FF' },
  { label: 'Media Encoder', icon: SiAdobecreativecloud, color: '#FF0000' },
];

export default function DesignerPage({ projects }: DesignerPageProps) {
  const { scrollYProgress } = useScroll();

  const accentColor = (a: string) =>
    a === 'rose' ? 'text-rose-500' :
    a === 'amber' ? 'text-amber-500' : 'text-indigo-500';

  const accentBg = (a: string) =>
    a === 'rose' ? 'dark:bg-rose-500/10 bg-rose-50 dark:border-rose-500/20 border-rose-100' :
    a === 'amber' ? 'dark:bg-amber-500/10 bg-amber-50 dark:border-amber-500/20 border-amber-100' :
    'dark:bg-indigo-500/10 bg-indigo-50 dark:border-indigo-500/20 border-indigo-100';

  return (
    <Layout>
      <JSONLD type="ProfessionalService" data={schemas.designer} />
      <Head>
        <title>L&apos;Artiste Digital | Designer UI/UX & Vidéo</title>
        <meta name="description" content="Expert en Design UI/UX, identité visuelle et création vidéo." />
        <meta name="keywords" content="Designer UI/UX, Design Graphique, Branding, Motion Design, Montage Vidéo" />
      </Head>

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-rose-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* ── HERO ── */}
      <section className="min-h-[85vh] flex items-center dark:bg-[#0a0a0f] bg-[#fafafc] pt-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] dark:bg-rose-600/6 bg-rose-100/30 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[1100px] mx-auto px-6 w-full relative z-10">
          <div className="max-w-[760px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 dark:bg-rose-500/10 bg-rose-50 dark:border-rose-500/20 border-rose-100 border rounded-full mb-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest">Direction Artistique & Création</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold dark:text-white text-zinc-900 leading-[1.05] tracking-tight mb-6 text-balance"
            >
              Je filme et je <span className="text-rose-500 italic">monte</span>.{' '}
              De la captation au rendu final.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="text-lg dark:text-zinc-500 text-zinc-500 mb-10 max-w-[560px] leading-[1.75]"
            >
              Mon approche repose sur un équilibre entre rigueur technique et une sensibilité acquise au fil de projets variés : événementiel, documentaires, clips.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/contact" className="h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg shadow-rose-600/20">
                Démarrer un projet
              </Link>
              <Link href="/projects" className="h-11 px-6 dark:bg-white/[0.04] bg-white dark:hover:bg-white/[0.08] hover:bg-zinc-100 dark:text-zinc-200 text-zinc-700 dark:border-white/[0.08] border-zinc-200 border rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2">
                Voir mes réalisations
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 dark:bg-[#0a0a0f] bg-[#fafafc] border-t dark:border-white/[0.05] border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest mb-10">Services</div>
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

      {/* ── SETUP ── */}
      {projects.length > 1 && (
        <section className="py-20 dark:bg-[#0a0a0f] bg-[#fafafc] border-t dark:border-white/[0.05] border-zinc-100">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden dark:bg-zinc-900 bg-zinc-100 border dark:border-white/[0.06] border-zinc-200">
                <Image src={projects[0]?.imageUrl || '/hero-designer.jpg'} alt="Setup" fill className="object-cover" />
                <div className="absolute inset-0 dark:bg-rose-500/10 bg-rose-500/5 mix-blend-overlay" />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest mb-6">Équipement</div>
                <h2 className="text-3xl font-extrabold dark:text-white text-zinc-900 tracking-tight mb-6 text-balance">
                  Pas de compromis sur <span className="text-rose-500 italic">l&apos;image</span>.
                </h2>
                <div className="space-y-4 text-[15px] dark:text-zinc-400 text-zinc-600 leading-relaxed">
                  <p>Je travaille avec un <span className="dark:text-white text-zinc-900 font-semibold">Panasonic Lumix DMC-G7</span> en 4K ou Full HD selon les besoins, complété par un <span className="dark:text-white text-zinc-900 font-semibold">iPhone 13 Pro Max</span> pour les situations qui demandent plus de mobilité.</p>
                  <p>Le cadrage, la lumière disponible, la composition dans l&apos;instant — c&apos;est ce qui se décide sur place. La post-production demande autant de jugement.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── FORMATS ── */}
      <section className="py-20 dark:bg-white/[0.01] bg-zinc-50 border-t dark:border-white/[0.05] border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest mb-10">Terrains d&apos;intervention</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formats.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="p-6 dark:bg-white/[0.02] bg-white rounded-2xl border dark:border-white/[0.06] border-zinc-200 hover:dark:border-white/[0.1] hover:border-zinc-300 transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5 border ${accentBg(f.accent)}`}>
                  <f.icon className={`w-4 h-4 ${accentColor(f.accent)}`} />
                </div>
                <h3 className="text-sm font-bold dark:text-white text-zinc-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm dark:text-zinc-500 text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOGICIELS ── */}
      <section className="py-16 dark:bg-zinc-950 bg-zinc-900 text-white border-t dark:border-white/[0.05] border-zinc-800">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-widest mb-6">Maîtrise logicielle</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {logiciels.map((l, i) => (
              <div key={i} className="group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-200 cursor-default">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${l.color}15` }}>
                  <l.icon className="w-5 h-5" style={{ color: l.color }} />
                </div>
                <span className="text-[11px] font-semibold text-zinc-300 text-center leading-tight">{l.label}</span>
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
                <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest mb-3">Réalisations</div>
                <h2 className="text-3xl font-extrabold dark:text-white text-zinc-900 tracking-tight">Travaux récents</h2>
              </div>
              <Link href="/projects" className="text-[12px] font-semibold text-rose-500 flex items-center gap-1 hover:gap-2 transition-all duration-150">
                Voir tout <FiChevronRight className="w-3.5 h-3.5" />
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

      {/* ── WORKFLOW ── */}
      <section className="py-20 dark:bg-white/[0.01] bg-zinc-50 border-t dark:border-white/[0.05] border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest mb-6">Workflow de production</div>
          <h2 className="text-3xl font-extrabold dark:text-white text-zinc-900 tracking-tight mb-12 text-balance">Comment je produis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="absolute top-5 left-0 right-0 h-px dark:bg-white/[0.05] bg-zinc-200 hidden md:block" />
            {workflow.map((step, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xs font-bold mb-5 relative z-10 shadow-lg shadow-rose-600/20">
                  0{i + 1}
                </div>
                <h4 className="text-sm font-bold dark:text-white text-zinc-900 mb-2 tracking-tight">{step.t}</h4>
                <p className="text-xs dark:text-zinc-500 text-zinc-500 leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 bg-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-700" />
        <div className="max-w-[1100px] mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-balance">
            Fixer l&apos;instant, orchestrer le <span className="text-rose-200">mouvement</span>.
          </h2>
          <p className="text-lg text-rose-100 mb-10 max-w-[480px] mx-auto leading-[1.75] opacity-90">
            Un rendu qui tient ses promesses techniques autant qu&apos;esthétiques.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="h-11 px-6 bg-white text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-semibold transition-colors duration-150 flex items-center gap-2 shadow-lg">
              Solliciter une expertise
            </Link>
            <Link href="/projects" className="h-11 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2">
              Voir mes réalisations
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
    }).sort({ featured: -1, order: 1 }).limit(4).lean();
    return {
      props: { projects: JSON.parse(JSON.stringify(projects)) },
      revalidate: 60,
    };
  } catch {
    return { props: { projects: [] } };
  }
};
