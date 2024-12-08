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
      name: 'Unread Messages',
      value: stats.unreadMessages,
      icon: <FiMail className="h-6 w-6 text-primary-600" />,
      description: 'New messages from visitors',
    },
    {
      name: 'Total Projects',
      value: stats.totalProjects,
      icon: <FiFolder className="h-6 w-6 text-primary-600" />,
      description: 'Projects in your portfolio',
    },
    {
      name: 'Total Skills',
      value: stats.totalSkills,
      icon: <FiAward className="h-6 w-6 text-primary-600" />,
      description: 'Skills and technologies',
    },
    {
      name: 'Total Experiences',
      value: stats.totalExperiences,
      icon: <FiBriefcase className="h-6 w-6 text-primary-600" />,
      description: 'Work and education experiences',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statsList.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:px-6 sm:py-6"
        >
          <dt>
            <div className="absolute rounded-md bg-primary-50 dark:bg-primary-900/10 p-3">
              {stat.icon}
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="ml-2 flex items-baseline text-sm text-gray-500 dark:text-gray-400">
              {stat.description}
            </p>
          </dd>
        </div>
      ))}
    </div>
  );
}
