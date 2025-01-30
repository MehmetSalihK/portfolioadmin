import { format } from 'date-fns';
import { FiMail, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';

interface Activity {
  id: string;
  type: 'message' | 'project' | 'skill' | 'experience';
  action: 'create' | 'update' | 'delete';
  title: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity['type'], action: Activity['action']) => {
    switch (action) {
      case 'create':
        return FiPlus;
      case 'update':
        return FiEdit;
      case 'delete':
        return FiTrash2;
      default:
        return type === 'message' ? FiMail : FiEdit;
    }
  };

  const getActionColor = (action: Activity['action']) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => {
              const Icon = getIcon(activity.type, activity.action);
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== activities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${getActionColor(
                            activity.action
                          )}`}
                        >
                          <Icon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.action.charAt(0).toUpperCase() +
                              activity.action.slice(1)}{' '}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </span>
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(activity.timestamp), 'PPp')}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
