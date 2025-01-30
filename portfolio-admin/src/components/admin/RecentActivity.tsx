import { format } from 'date-fns';
import { FiMail, FiFolder, FiBriefcase, FiAward } from 'react-icons/fi';

interface Activity {
  _id: string;
  type: 'message' | 'project' | 'skill' | 'experience';
  action: 'create' | 'update' | 'delete';
  itemId: string;
  itemName: string;
  createdAt: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const getIcon = (type: Activity['type']) => {
  switch (type) {
    case 'message':
      return <FiMail className="h-5 w-5" />;
    case 'project':
      return <FiFolder className="h-5 w-5" />;
    case 'skill':
      return <FiAward className="h-5 w-5" />;
    case 'experience':
      return <FiBriefcase className="h-5 w-5" />;
  }
};

const getActionColor = (action: Activity['action']) => {
  switch (action) {
    case 'create':
      return 'text-green-500 bg-green-100 dark:bg-green-900/20';
    case 'update':
      return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
    case 'delete':
      return 'text-red-500 bg-red-100 dark:bg-red-900/20';
  }
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity._id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div
                  className={`relative rounded-full p-2 ${getActionColor(
                    activity.action
                  )}`}
                >
                  {getIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.itemName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {activity.action.charAt(0).toUpperCase() +
                        activity.action.slice(1)}{' '}
                      {activity.type}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>{format(new Date(activity.createdAt), 'PPpp')}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
