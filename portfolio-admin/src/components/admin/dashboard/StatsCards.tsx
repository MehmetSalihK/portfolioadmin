import { FiMail, FiBriefcase, FiCode, FiAward } from 'react-icons/fi';

interface StatsCardsProps {
  stats: {
    unreadMessages: number;
    totalProjects: number;
    totalSkills: number;
    totalExperiences: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      name: 'Unread Messages',
      value: stats.unreadMessages,
      icon: FiMail,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Projects',
      value: stats.totalProjects,
      icon: FiCode,
      color: 'bg-blue-500',
    },
    {
      name: 'Skills',
      value: stats.totalSkills,
      icon: FiAward,
      color: 'bg-green-500',
    },
    {
      name: 'Experiences',
      value: stats.totalExperiences,
      icon: FiBriefcase,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.name}
          className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:px-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${card.color}`}>
              <card.icon
                className="h-6 w-6 text-white"
                aria-hidden="true"
              />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {card.value}
            </p>
          </dd>
        </div>
      ))}
    </div>
  );
}
