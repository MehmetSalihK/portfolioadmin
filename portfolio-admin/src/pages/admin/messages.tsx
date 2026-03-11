import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiEye, FiArchive, FiTrash2, FiX, FiCheck, FiLoader, FiUser, FiBriefcase, FiPhone, FiCalendar, FiInbox } from 'react-icons/fi';
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
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <FiMail className="text-2xl text-indigo-500" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Messages</h1>
            </div>
            <p className="text-zinc-500 font-medium">Gérez les demandes de contact de votre portfolio.</p>
          </div>

          <div className="flex items-center gap-3 p-1 bg-zinc-900/50 rounded-xl border border-white/5 w-fit">
            {(['all', 'unread', 'read', 'archived'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === f
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                {f === 'all' ? 'Tous' : f === 'unread' ? 'Non lus' : f === 'read' ? 'Lus' : 'Archivés'}
              </button>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <FiX className="w-5 h-5" />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-600 font-black text-[10px] uppercase tracking-widest">Chargement des messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-zinc-900/50 rounded-[2.5rem] p-16 text-center border border-white/5">
            <div className="w-20 h-20 bg-zinc-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <FiInbox className="text-4xl text-zinc-600" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Aucun message</h3>
            <p className="text-zinc-500 font-medium max-w-xs mx-auto">
              Les messages reçus via votre formulaire de contact apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredMessages.map((message) => (
                <motion.div
                  key={message._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative bg-zinc-900/50 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden ${
                    message.status === 'unread' ? 'ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10' : ''
                  }`}
                >
                  {/* Status Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    message.status === 'unread' ? 'bg-indigo-500' : 
                    message.status === 'archived' ? 'bg-zinc-700' : 'bg-emerald-500'
                  }`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4 pl-2">
                       <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                            {message.firstName} {message.lastName}
                          </h3>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            {format(new Date(message.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </p>
                       </div>
                       {message.status === 'unread' && (
                         <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Nouveau</span>
                         </div>
                       )}
                    </div>

                    <div className="pl-2 space-y-3 mb-6">
                      <p className="text-xs font-bold text-zinc-400 truncate">{message.email}</p>
                      <p className="text-sm font-black text-white leading-snug line-clamp-1">{message.subject}</p>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed italic">"{message.message}"</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewMessage(message)}
                          className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-indigo-600 transition-all duration-300 border border-white/5"
                          title="Voir le message"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        
                        {message.status !== 'archived' && (
                          <button
                            onClick={() => updateMessageStatus(message._id, 'archived')}
                            disabled={isUpdating === message._id}
                            className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-amber-600 transition-all duration-300 border border-white/5 disabled:opacity-50"
                            title="Archiver"
                          >
                            {isUpdating === message._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiArchive className="w-4 h-4" />}
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteMessage(message._id)}
                          disabled={isUpdating === message._id}
                          className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-rose-600 transition-all duration-300 border border-white/5 disabled:opacity-50"
                          title="Supprimer"
                        >
                          {isUpdating === message._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <a
                        href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                        className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors"
                      >
                        Répondre
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Modal View */}
        <Modal
          isOpen={isViewingMessage}
          onClose={closeMessageView}
          title="Message Détails"
        >
          {selectedMessage && (
            <div className="space-y-8 py-4">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                          <FiUser className="w-6 h-6 text-indigo-500" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                            {selectedMessage.firstName} {selectedMessage.lastName}
                          </h3>
                          <p className="text-xs font-bold text-zinc-400">{selectedMessage.email}</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                       {selectedMessage.company && (
                         <div className="flex items-center gap-2 text-zinc-500">
                           <FiBriefcase className="w-3.5 h-3.5" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{selectedMessage.company}</span>
                         </div>
                       )}
                       {selectedMessage.phone && (
                         <div className="flex items-center gap-2 text-zinc-500">
                           <FiPhone className="w-3.5 h-3.5" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{selectedMessage.phone}</span>
                         </div>
                       )}
                       <div className="flex items-center gap-2 text-zinc-500">
                         <FiCalendar className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">
                           {format(new Date(selectedMessage.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                         </span>
                       </div>
                    </div>
                 </div>

                 <div className="shrink-0">
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                      selectedMessage.status === 'unread' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 
                      selectedMessage.status === 'archived' ? 'bg-zinc-800/50 border-white/5 text-zinc-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                       <div className={`w-2 h-2 rounded-full ${
                          selectedMessage.status === 'unread' ? 'bg-indigo-500 animate-pulse' : 
                          selectedMessage.status === 'archived' ? 'bg-zinc-600' : 'bg-emerald-500'
                       }`} />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                         {selectedMessage.status === 'unread' ? 'Non lu' : selectedMessage.status === 'archived' ? 'Archivé' : 'Lu'}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-indigo-500/20 transition-all duration-300">
                 <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Objet : {selectedMessage.subject}</h4>
                 <div className="text-sm text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap italic">
                    "{selectedMessage.message}"
                 </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex flex-wrap gap-3">
                  {selectedMessage.status === 'unread' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage._id, 'read')}
                      disabled={isUpdating === selectedMessage._id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating === selectedMessage._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
                      <span>Marquer comme lu</span>
                    </button>
                  )}
                  
                  {selectedMessage.status !== 'archived' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage._id, 'archived')}
                      disabled={isUpdating === selectedMessage._id}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 border border-white/5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating === selectedMessage._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiArchive className="w-4 h-4" />}
                      <span>Archiver</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteMessage(selectedMessage._id)}
                    disabled={isUpdating === selectedMessage._id}
                    className="bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white px-6 py-2.5 rounded-xl transition-all duration-300 border border-rose-500/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating === selectedMessage._id ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                    <span>Supprimer</span>
                  </button>
                </div>
                
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  <FiMail className="w-4 h-4" />
                  Répondre par e-mail
                </a>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
