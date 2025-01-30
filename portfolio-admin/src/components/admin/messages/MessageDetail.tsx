import { format } from 'date-fns';
import Modal from '../Modal';
import { FiMail, FiUser, FiCalendar, FiTag } from 'react-icons/fi';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
}

interface MessageDetailProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onStatusChange: (messageId: string, newStatus: Message['status']) => Promise<void>;
}

export default function MessageDetail({
  isOpen,
  onClose,
  message,
  onStatusChange,
}: MessageDetailProps) {
  if (!message) return null;

  const statusColors = {
    unread: 'bg-yellow-100 text-yellow-800',
    read: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Message Details">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {message.subject}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <FiUser className="mr-2" />
              {message.name}
            </div>
            <div className="flex items-center">
              <FiMail className="mr-2" />
              <a
                href={`mailto:${message.email}`}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                {message.email}
              </a>
            </div>
            <div className="flex items-center">
              <FiCalendar className="mr-2" />
              {format(new Date(message.createdAt), 'PPp')}
            </div>
            <div className="flex items-center">
              <FiTag className="mr-2" />
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[message.status]
                }`}
              >
                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {message.message}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            {message.status !== 'read' && (
              <button
                type="button"
                onClick={() => onStatusChange(message._id, 'read')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Mark as Read
              </button>
            )}
            {message.status !== 'archived' && (
              <button
                type="button"
                onClick={() => onStatusChange(message._id, 'archived')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Archive
              </button>
            )}
          </div>
          <a
            href={`mailto:${message.email}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Reply
          </a>
        </div>
      </div>
    </Modal>
  );
}
