import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import Head from 'next/head';
import { format } from 'date-fns';
import { FiMail, FiArchive, FiInbox } from 'react-icons/fi';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/Layout';
import MessageDetail from '@/components/admin/messages/MessageDetail';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';

type MessageStatus = 'unread' | 'read' | 'archived';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

interface MessagesPageProps {
  initialMessages: Message[];
}

export default function MessagesPage({ initialMessages }: MessagesPageProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MessageStatus>('unread');

  const fetchMessages = async (status?: MessageStatus) => {
    try {
      const query = status ? `?status=${status}` : '';
      const response = await fetch(`/api/messages${query}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  useEffect(() => {
    fetchMessages(activeTab);
  }, [activeTab]);

  const handleStatusChange = async (messageId: string, newStatus: MessageStatus) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update message status');

      const updatedMessage = await response.json();
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? updatedMessage : msg))
      );

      if (selectedMessage?._id === messageId) {
        setSelectedMessage(updatedMessage);
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  const tabs = [
    { id: 'unread', name: 'Unread', icon: FiMail },
    { id: 'read', name: 'Read', icon: FiInbox },
    { id: 'archived', name: 'Archived', icon: FiArchive },
  ] as const;

  const statusColors = {
    unread: 'bg-yellow-100 text-yellow-800',
    read: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <AdminLayout>
      <Head>
        <title>Messages - Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Messages
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${
                      activeTab === id
                        ? 'text-primary-500 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400'
                    }
                  `}
                />
                {name}
              </button>
            ))}
          </nav>
        </div>

        {/* Messages List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No messages found
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setSelectedMessage(message);
                  setDetailModalOpen(true);
                  if (message.status === 'unread') {
                    handleStatusChange(message._id, 'read');
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {message.name}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[message.status]
                          }`}
                        >
                          {message.status.charAt(0).toUpperCase() +
                            message.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {message.subject}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(message.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <MessageDetail
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  await connectDB();

  const messages = await Contact.find({ status: 'unread' })
    .sort({ createdAt: -1 })
    .lean();

  return {
    props: {
      initialMessages: JSON.parse(JSON.stringify(messages)),
    },
  };
};
