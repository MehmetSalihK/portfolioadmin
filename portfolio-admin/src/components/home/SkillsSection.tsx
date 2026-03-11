import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FaReact, FaNodeJs, FaGit, FaDocker, FaPhp,
  FaWordpress, FaGithub, FaGitlab, FaHtml5, FaCss3Alt
} from 'react-icons/fa';
import { 
  SiTypescript, SiJavascript, SiMongodb, SiPostgresql,
  SiTailwindcss, SiNextdotjs, SiAdobephotoshop, SiAdobeaftereffects,
  SiAdobepremierepro, SiFlutter, SiVuedotjs, SiMysql,
  SiFirebase, SiVisualstudiocode, SiPostman, SiBootstrap, SiFigma
} from 'react-icons/si';
import { FiArrowRight } from 'react-icons/fi';

const skillCategories = [
  {
    title: "Développement Web",
    accentColor: "indigo",
    skills: [
      { name: "JavaScript", icon: <SiJavascript className="w-4 h-4" /> },
      { name: "TypeScript", icon: <SiTypescript className="w-4 h-4" /> },
      { name: "React", icon: <FaReact className="w-4 h-4" /> },
      { name: "Next.js", icon: <SiNextdotjs className="w-4 h-4" /> },
      { name: "Vue.js", icon: <SiVuedotjs className="w-4 h-4" /> },
      { name: "HTML", icon: <FaHtml5 className="w-4 h-4" /> },
      { name: "CSS", icon: <FaCss3Alt className="w-4 h-4" /> },
    ]
  },
  {
    title: "Base de données & Backend",
    accentColor: "emerald",
    skills: [
      { name: "Node.js", icon: <FaNodeJs className="w-4 h-4" /> },
      { name: "MongoDB", icon: <SiMongodb className="w-4 h-4" /> },
      { name: "MySQL", icon: <SiMysql className="w-4 h-4" /> },
      { name: "PostgreSQL", icon: <SiPostgresql className="w-4 h-4" /> },
      { name: "PHP", icon: <FaPhp className="w-4 h-4" /> },
      { name: "Firebase", icon: <SiFirebase className="w-4 h-4" /> },
    ]
  },
  {
    title: "Outils & DevOps",
    accentColor: "violet",
    skills: [
      { name: "Git", icon: <FaGit className="w-4 h-4" /> },
      { name: "GitHub", icon: <FaGithub className="w-4 h-4" /> },
      { name: "GitLab", icon: <FaGitlab className="w-4 h-4" /> },
      { name: "Docker", icon: <FaDocker className="w-4 h-4" /> },
      { name: "VS Code", icon: <SiVisualstudiocode className="w-4 h-4" /> },
      { name: "Postman", icon: <SiPostman className="w-4 h-4" /> },
    ]
  },
  {
    title: "CMS & Frameworks",
    accentColor: "amber",
    skills: [
      { name: "WordPress", icon: <FaWordpress className="w-4 h-4" /> },
      { name: "Bootstrap", icon: <SiBootstrap className="w-4 h-4" /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className="w-4 h-4" /> },
      { name: "Flutter", icon: <SiFlutter className="w-4 h-4" /> },
    ]
  },
  {
    title: "Design & Création",
    accentColor: "rose",
    skills: [
      { name: "Photoshop", icon: <SiAdobephotoshop className="w-4 h-4" /> },
      { name: "After Effects", icon: <SiAdobeaftereffects className="w-4 h-4" /> },
      { name: "Premiere Pro", icon: <SiAdobepremierepro className="w-4 h-4" /> },
      { name: "Figma", icon: <SiFigma className="w-4 h-4" /> },
    ]
  },
];

// Chip styles for dark mode + light mode
const accentMap: Record<string, { chip: string; dot: string; badge: string }> = {
  indigo: {
    chip: 'dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200',
    dot: 'bg-indigo-500',
    badge: 'dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-600 dark:border-indigo-500/20 border-indigo-200',
  },
  emerald: {
    chip: 'dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-400 text-emerald-600 dark:border-emerald-500/20 border-emerald-200',
    dot: 'bg-emerald-500',
    badge: 'dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-400 text-emerald-600 dark:border-emerald-500/20 border-emerald-200',
  },
  violet: {
    chip: 'dark:bg-violet-500/10 bg-violet-50 dark:text-violet-400 text-violet-600 dark:border-violet-500/20 border-violet-200',
    dot: 'bg-violet-500',
    badge: 'dark:bg-violet-500/10 bg-violet-50 dark:text-violet-400 text-violet-600 dark:border-violet-500/20 border-violet-200',
  },
  amber: {
    chip: 'dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600 dark:border-amber-500/20 border-amber-200',
    dot: 'bg-amber-500',
    badge: 'dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600 dark:border-amber-500/20 border-amber-200',
  },
  rose: {
    chip: 'dark:bg-rose-500/10 bg-rose-50 dark:text-rose-400 text-rose-600 dark:border-rose-500/20 border-rose-200',
    dot: 'bg-rose-500',
    badge: 'dark:bg-rose-500/10 bg-rose-50 dark:text-rose-400 text-rose-600 dark:border-rose-500/20 border-rose-200',
  },
};

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24 dark:bg-[#09090f] bg-white relative overflow-hidden transition-colors duration-300">
      {/* Ambient BG */}
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] justify-center mb-3">
              <span className="w-8 h-[1px] bg-indigo-500" />
              Expertise
              <span className="w-8 h-[1px] bg-indigo-500" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">
              Compétences techniques
            </h2>
            <p className="dark:text-zinc-500 text-zinc-500 max-w-2xl mx-auto font-medium">
              Technologies et outils que j&apos;utilise au quotidien pour construire des applications modernes et performantes.
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {skillCategories.map((category, categoryIndex) => {
              const accent = accentMap[category.accentColor];
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                  className="group"
                >
                  <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl p-7 dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/30 hover:border-indigo-400 transition-all duration-300 h-full shadow-sm hover:shadow-xl">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-3 h-3 rounded-full ${accent.dot} shadow-lg`} />
                      <h3 className="text-base font-black dark:text-white text-zinc-900 tracking-tight">{category.title}</h3>
                    </div>

                    {/* Skills chips - improved layout */}
                    <div className="flex flex-wrap gap-2.5">
                      {category.skills.map((skill, skillIndex) => (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: categoryIndex * 0.1 + skillIndex * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all duration-200 cursor-default ${accent.chip}`}
                        >
                          <span className="opacity-90">{skill.icon}</span>
                          {skill.name}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}