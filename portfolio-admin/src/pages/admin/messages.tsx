import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiEye, FiTrash2, FiCheck, FiX, FiStar, FiArchive } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des messages');
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchMessages();
    }
  }, [status, router, fetchMessages]);

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return message.status === 'unread';
    if (filter === 'read') return message.status === 'read';
    return true;
  });

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });

      if (response.ok) {
        await fetchMessages();
        toast.success('Message marqué comme lu');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du message');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        const response = await fetch(`/api/admin/messages/${messageId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchMessages();
          toast.success('Message supprimé');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression du message');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FiMail className="w-8 h-8" />
                Messages
              </h1>
              <p className="text-gray-400 mt-1">
                {messages.filter(m => m.status === 'unread').length} messages non lus
              </p>
            </div>
            
            {/* Filtres */}
            <div className="flex gap-2 bg-[#1A1A1A] p-1 rounded-lg border border-gray-800">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-[#2A2A2A] text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Tous' : f === 'unread' ? 'Non lus' : 'Lus'}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des messages */}
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredMessages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`bg-[#1A1A1A] rounded-xl overflow-hidden border ${
                    message.status === 'unread'
                      ? 'border-gray-700'
                      : 'border-gray-800'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {message.status === 'unread' && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                          )}
                          <h3 className="text-lg font-semibold text-white">
                            {message.subject}
                          </h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          De : {message.firstName} {message.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">{message.email}</p>
                        {message.company && (
                          <p className="text-gray-400 text-sm">Société : {message.company}</p>
                        )}
                        <p className="text-gray-300 mt-4 line-clamp-2">{message.message}</p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {message.status === 'unread' && (
                          <button
                            onClick={() => handleMarkAsRead(message._id)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="Marquer comme lu"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                          title="Voir le message"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(message._id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                      <time className="text-gray-500 text-sm">
                        {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                      <div className="flex gap-2">
                        <a
                          href={`mailto:${message.email}`}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Répondre →
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal avec fond sombre */}
        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1A1A1A] rounded-2xl w-full max-w-3xl overflow-hidden border border-gray-800"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <p className="text-gray-400">
                        De : {selectedMessage.firstName} {selectedMessage.lastName}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Informations de contact
                      </h3>
                      <div className="grid gap-3">
                        <p className="text-gray-300">
                          <span className="text-gray-400">Email :</span>{" "}
                          <a href={`mailto:${selectedMessage.email}`} className="text-blue-400 hover:text-blue-300">
                            {selectedMessage.email}
                          </a>
                        </p>
                        {selectedMessage.phone && (
                          <p className="text-gray-300">
                            <span className="text-gray-400">Téléphone :</span>{" "}
                            <a href={`tel:${selectedMessage.phone}`} className="text-blue-400 hover:text-blue-300">
                              {selectedMessage.phone}
                            </a>
                          </p>
                        )}
                        {selectedMessage.company && (
                          <p className="text-gray-300">
                            <span className="text-gray-400">Société :</span>{" "}
                            {selectedMessage.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Fermer
                    </button>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Répondre
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
