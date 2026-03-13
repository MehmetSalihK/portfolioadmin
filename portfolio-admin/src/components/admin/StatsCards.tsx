import { FiMail, FiFolder, FiBriefcase, FiAward, FiArrowUpRight, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Stat {
  name: string;
  value: number;
  icon: JSX.Element;
  description: string;
  color: string;
}

interface StatsCardsProps {
  stats: {
    unreadMessages: number;
    totalProjects: number;
    totalSkills: number;
    totalExperiences: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statsList: Stat[] = [
    {
      name: 'Messages',
      value: stats.unreadMessages,
      icon: <FiMail />,
      description: 'Incoming communication',
      color: 'indigo'
    },
    {
      name: 'Portfolio',
      value: stats.totalProjects,
      icon: <FiFolder />,
      description: 'Engineering projects',
      color: 'violet'
    },
    {
      name: 'Expertise',
      value: stats.totalSkills,
      icon: <FiAward />,
      description: 'Technical stack',
      color: 'emerald'
    },
    {
      name: 'Experience',
      value: stats.totalExperiences,
      icon: <FiBriefcase />,
      description: 'Professional records',
      color: 'amber'
    },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'indigo': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'violet': return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
      case 'emerald': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'amber': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {statsList.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group bg-white dark:bg-zinc-900/40 backdrop-blur-xl border dark:border-white/5 border-zinc-200 p-8 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-${stat.color}-500`} />

          <div className="flex items-center justify-between mb-8">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:rotate-12 ${getColorClass(stat.color)}`}>
               {stat.icon}
            </div>
            <FiArrowUpRight className="text-zinc-300 dark:text-zinc-700 group-hover:dark:text-white transition-colors" />
          </div>

          <div className="space-y-1">
            <h3 className="text-[10px] font-black dark:text-zinc-500 text-zinc-500 uppercase tracking-[0.2em]">
              {stat.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black dark:text-white text-zinc-900 tabular-nums tracking-tighter">
                {stat.value}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Nodes
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t dark:border-white/5 border-zinc-100">
             <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <FiActivity className="w-3 h-3" />
                {stat.description}
             </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
