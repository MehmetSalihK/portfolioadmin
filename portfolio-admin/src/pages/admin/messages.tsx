import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, filter]);

  const fetchMessages = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: 'read' | 'archived') => {
    try {
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

      // Mettre à jour l'état local
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, status: newStatus } : msg
      ));

      // Si le message sélectionné est celui qu'on vient de mettre à jour
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du message');
      }

      // Mettre à jour l'état local
      setMessages(messages.filter(msg => msg._id !== messageId));
      
      // Si le message supprimé était sélectionné, le désélectionner
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression du message. Veuillez réessayer.');
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    return message.status === filter;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Liste des messages */}
          <div className="w-full md:w-1/3 bg-[#1E1E1E] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Tous les messages</h2>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="unread">Non lus</option>
                  <option value="read">Lus</option>
                  <option value="archived">Archivés</option>
                </select>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-gray-400 mt-2">Chargement des messages...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucun message trouvé</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredMessages.map((message) => (
                    <div 
                      key={message._id}
                      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                        selectedMessage?._id === message._id ? 'bg-gray-800' : ''
                      } ${message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">{message.firstName} {message.lastName}</h3>
                          <p className="text-sm text-gray-400">{message.email}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1 truncate">{message.subject}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Détails du message */}
          <div className="w-full md:w-2/3 bg-[#1E1E1E] rounded-lg overflow-hidden">
            {selectedMessage ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedMessage.subject}</h2>
                    <p className="text-gray-400">
                      De: {selectedMessage.firstName} {selectedMessage.lastName} &lt;{selectedMessage.email}&gt;
                    </p>
                    <p className="text-gray-400">
                      Date: {format(new Date(selectedMessage.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {selectedMessage.status === 'unread' && (
                      <button
                        onClick={() => updateMessageStatus(selectedMessage._id, 'read')}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                      >
                        Marquer comme lu
                      </button>
                    )}
                    {selectedMessage.status !== 'archived' && (
                      <button
                        onClick={() => updateMessageStatus(selectedMessage._id, 'archived')}
                        className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
                      >
                        Archiver
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Message</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="mt-6">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
                  >
                    Répondre
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-400">Sélectionnez un message pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
