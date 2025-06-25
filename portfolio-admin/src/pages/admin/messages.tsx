import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiEye, FiArchive, FiTrash2, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [isViewingMessage, setIsViewingMessage] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/messages?filter=${filter}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }
      
      const data = await response.json();
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les messages. Veuillez réessayer.');
      toast.error('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, fetchMessages]);

  const updateMessageStatus = async (messageId: string, newStatus: 'read' | 'archived') => {
    try {
      setIsUpdating(messageId);
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, status: newStatus } : msg
      ));

      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
      
      toast.success(`Message marqué comme ${newStatus === 'read' ? 'lu' : 'archivé'}`);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      setIsUpdating(messageId);
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du message');
      }

      setMessages(messages.filter(msg => msg._id !== messageId));
      
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
        setIsViewingMessage(false);
      }
      
      toast.success('Message supprimé avec succès');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la suppression du message');
    } finally {
      setIsUpdating(null);
    }
  };

  const viewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewingMessage(true);
    
    if (message.status === 'unread') {
      updateMessageStatus(message._id, 'read');
    }
  };

  const closeMessageView = () => {
    setIsViewingMessage(false);
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    return message.status === filter;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <FiMail className="text-2xl text-white" />
            <h1 className="text-2xl font-bold text-white">Messages</h1>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les messages</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
              <option value="archived">Archivés</option>
            </select>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
            <FiMail className="text-5xl text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucun message trouvé</p>
            <p className="text-gray-500 text-sm mt-2">Les messages que vous recevez via le formulaire de contact apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMessages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-[#1E1E1E] rounded-lg overflow-hidden border-l-4 ${
                  message.status === 'unread' ? 'border-l-blue-500' : 
                  message.status === 'archived' ? 'border-l-gray-500' : 'border-l-green-500'
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{message.firstName} {message.lastName}</h3>
                    <span className="text-xs text-gray-500">
                      {format(new Date(message.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{message.email}</p>
                  <p className="text-sm text-gray-300 font-medium mb-3">{message.subject}</p>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{message.message}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewMessage(message)}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                        title="Voir le message"
                      >
                        <FiEye size={16} />
                      </button>
                      
                      {message.status !== 'archived' && (
                        <button
                          onClick={() => updateMessageStatus(message._id, 'archived')}
                          disabled={isUpdating === message._id}
                          className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="Archiver"
                        >
                          {isUpdating === message._id ? (
                            <FiLoader className="animate-spin" size={16} />
                          ) : (
                            <FiArchive size={16} />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteMessage(message._id)}
                        disabled={isUpdating === message._id}
                        className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        {isUpdating === message._id ? (
                          <FiLoader className="animate-spin" size={16} />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </button>
                    </div>
                    
                    <a
                      href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Répondre
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Modal de visualisation du message */}
        <AnimatePresence>
          {isViewingMessage && selectedMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={closeMessageView}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1E1E1E] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">{selectedMessage.subject}</h2>
                      <p className="text-gray-400">
                        De: {selectedMessage.firstName} {selectedMessage.lastName} &lt;{selectedMessage.email}&gt;
                      </p>
                      <p className="text-gray-400">
                        Date: {format(new Date(selectedMessage.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <button
                      onClick={closeMessageView}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {selectedMessage.company && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Entreprise</h3>
                        <p className="text-white">{selectedMessage.company}</p>
                      </div>
                    )}
                    {selectedMessage.phone && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Téléphone</h3>
                        <p className="text-white">{selectedMessage.phone}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {selectedMessage.status === 'unread' && (
                        <button
                          onClick={() => updateMessageStatus(selectedMessage._id, 'read')}
                          disabled={isUpdating === selectedMessage._id}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {isUpdating === selectedMessage._id ? (
                            <FiLoader className="animate-spin" size={16} />
                          ) : (
                            <FiCheck size={16} />
                          )}
                          <span>Marquer comme lu</span>
                        </button>
                      )}
                      
                      {selectedMessage.status !== 'archived' && (
                        <button
                          onClick={() => updateMessageStatus(selectedMessage._id, 'archived')}
                          disabled={isUpdating === selectedMessage._id}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {isUpdating === selectedMessage._id ? (
                            <FiLoader className="animate-spin" size={16} />
                          ) : (
                            <FiArchive size={16} />
                          )}
                          <span>Archiver</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteMessage(selectedMessage._id)}
                        disabled={isUpdating === selectedMessage._id}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        {isUpdating === selectedMessage._id ? (
                          <FiLoader className="animate-spin" size={16} />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                        <span>Supprimer</span>
                      </button>
                    </div>
                    
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
