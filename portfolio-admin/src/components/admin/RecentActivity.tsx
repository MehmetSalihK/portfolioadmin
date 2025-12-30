import React from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCode, FiBriefcase, FiFolder } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'project' | 'skill' | 'experience';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  date: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <FiFolder className="w-4 h-4" />;
      case 'skill': return <FiCode className="w-4 h-4" />;
      case 'experience': return <FiBriefcase className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'updated': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'deleted': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
        Aucune activité récente
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activité Récente</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities.map((activity, index) => (
          <div key={`${activity.id}-${index}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.type === 'project' ? 'Projet' : activity.type === 'skill' ? 'Compétence' : 'Expérience'} 
                  {' • '}
                  {activity.action === 'created' ? 'Ajouté' : activity.action === 'updated' ? 'Modifié' : 'Supprimé'}
                </p>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: fr })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
