import { FiMail, FiFolder, FiBriefcase, FiAward } from 'react-icons/fi';

interface Stat {
  name: string;
  value: number;
  icon: JSX.Element;
  description: string;
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
      name: 'Messages non lus',
      value: stats.unreadMessages,
      icon: <FiMail className="h-5 w-5 text-indigo-400" />,
      description: 'Nouveaux messages',
    },
    {
      name: 'Total Projets',
      value: stats.totalProjects,
      icon: <FiFolder className="h-5 w-5 text-indigo-400" />,
      description: 'Projets dans votre portfolio',
    },
    {
      name: 'Total Compétences',
      value: stats.totalSkills,
      icon: <FiAward className="h-5 w-5 text-indigo-400" />,
      description: 'Technologies et expertises',
    },
    {
      name: 'Total Expériences',
      value: stats.totalExperiences,
      icon: <FiBriefcase className="h-5 w-5 text-indigo-400" />,
      description: 'Parcours pro et académique',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsList.map((stat, index) => (
        <div
          key={stat.name}
          className="relative overflow-hidden group bg-background-card border border-border-subtle p-6 rounded-xl hover:border-border-strong transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              {stat.icon}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 tracking-tight">
              {stat.name}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-white tabular-nums">
                {stat.value}
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                total
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}
