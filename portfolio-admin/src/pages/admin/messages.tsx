import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiMail, FiTrash } from 'react-icons/fi';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchMessages();
    }
  }, [status]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Messages</h1>
        </div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-[#252525] text-gray-400 text-sm">
                <th className="px-6 py-4 text-left">FROM</th>
                <th className="px-6 py-4 text-left">SUBJECT</th>
                <th className="px-6 py-4 text-left">DATE</th>
                <th className="px-6 py-4 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <motion.tr 
                  key={message._id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="border-t border-[#2A2A2A] hover:bg-[#252525] transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/messages/${message._id}`)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white">{message.name}</div>
                      <div className="text-gray-400 text-sm">{message.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{message.subject}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(message.date)}</td>
                  <td className="px-6 py-4">
                    {message.read ? (
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-sm rounded">
                        Read
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-sm rounded">
                        New
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
