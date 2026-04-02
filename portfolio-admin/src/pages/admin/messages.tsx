import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiEye, FiArchive, FiTrash2, FiX, FiCheck, FiLoader, FiUser, FiBriefcase, FiPhone, FiCalendar, FiInbox, FiTag, FiSend, FiStar, FiFilter } from 'react-icons/fi';
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

  useEffect(() => { if (status === 'unauthenticated') { router.push('/admin/login'); } }, [status, router]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/messages?filter=${filter}`);
      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les messages.');
      toast.error('Erreur de chargement');
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { if (status === 'authenticated') { fetchMessages(); } }, [status, fetchMessages]);

  const updateMessageStatus = async (messageId: string, newStatus: 'read' | 'archived') => {
    try {
      setIsUpdating(messageId);
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Erreur');
      setMessages(messages.map(msg => msg._id === messageId ? { ...msg, status: newStatus } : msg));
      if (selectedMessage?._id === messageId) setSelectedMessage({ ...selectedMessage, status: newStatus });
      toast.success(`Message ${newStatus === 'read' ? 'lu' : 'archivé'}`);
    } catch (err) { toast.error('Erreur de mise à jour'); } finally { setIsUpdating(null); }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      setIsUpdating(messageId);
      const response = await fetch(`/api/admin/messages/${messageId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur');
      setMessages(messages.filter(msg => msg._id !== messageId));
      if (selectedMessage?._id === messageId) { setSelectedMessage(null); setIsViewingMessage(false); }
      toast.success('Message supprimé');
    } catch (err) { toast.error('Erreur de suppression'); } finally { setIsUpdating(null); }
  };

  const viewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewingMessage(true);
    if (message.status === 'unread') updateMessageStatus(message._id, 'read');
  };

  const filteredMessages = messages.filter(m => filter === 'all' || m.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiMail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Flux Entrant</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 flex items-center gap-4">
                Inbox Hub
                <span className="text-sm font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-1 rounded-full text-slate-500">
                   {messages.filter(m => m.status === 'unread').length}
                </span>
             </h1>
             <p className="text-slate-500 font-medium max-w-lg">Gérez vos opportunités et conversations clients avec une réactivité SaaS.</p>
           </div>
           
           <div className="flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              {(['all', 'unread', 'read', 'archived'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-primary-500 text-primary-500 dark:text-white shadow-premium' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                   {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : f === 'read' ? 'Lues' : 'Archives'}
                </button>
              ))}
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Indexation des messages…</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] py-40 flex flex-col items-center justify-center space-y-6 text-center group">
             <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-premium">
                <FiInbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
             </div>
             <div>
                <h3 className="text-xl font-extrabold dark:text-white text-slate-900 uppercase tracking-tight">Boîte de réception vide</h3>
                <p className="text-sm font-medium text-slate-500 max-w-xs mt-2 italic">Aucun message ne correspond à votre filtre actuel.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             <AnimatePresence>
               {filteredMessages.map((msg, i) => (
                 <motion.div key={msg._id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`group relative bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[32px] p-8 hover:shadow-premium-lg transition-all duration-500 overflow-hidden ${msg.status === 'unread' ? 'ring-2 ring-primary-500/20 shadow-xl shadow-primary-500/5' : ''}`}>
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-12 -mt-12 transition-colors ${msg.status === 'unread' ? 'bg-primary-500' : 'bg-slate-500'}`} />
                    
                    <div className="flex justify-between items-start mb-6 relative">
                       <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-black text-xl transition-all ${msg.status === 'unread' ? 'bg-primary-500/10 border-primary-500/20 text-primary-500 shadow-premium' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400'}`}>
                             {msg.firstName[0]}{msg.lastName[0]}
                          </div>
                          <div>
                             <h4 className="text-base font-extrabold dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors capitalize">{msg.firstName} {msg.lastName}</h4>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(msg.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                          </div>
                       </div>
                       {msg.status === 'unread' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                    </div>

                    <div className="space-y-4 mb-8">
                       <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group-hover:border-primary-500/20 transition-all">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{msg.email}</p>
                          <h5 className="text-sm font-black dark:text-slate-200 text-slate-800 line-clamp-1">{msg.subject}</h5>
                       </div>
                       <p className="text-xs font-medium dark:text-slate-500 text-slate-400 italic line-clamp-2 leading-relaxed">"{msg.message}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                       <div className="flex gap-2">
                          <button onClick={() => viewMessage(msg)} className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm"><FiEye className="w-4 h-4"/></button>
                          <button onClick={() => updateMessageStatus(msg._id, 'archived')} className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm"><FiArchive className="w-4 h-4"/></button>
                          <button onClick={() => deleteMessage(msg._id)} className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><FiTrash2 className="w-4 h-4"/></button>
                       </div>
                       <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="text-[10px] font-black uppercase text-primary-500 hover:text-primary-600 tracking-widest flex items-center gap-2">Reply <FiSend /></a>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}

        {/* Message Modal Redesign */}
        <Modal isOpen={isViewingMessage} onClose={() => setIsViewingMessage(false)} title="Conversation Details">
           {selectedMessage && (
             <div className="space-y-10 py-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 dark:border-white/5 pb-10">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[32px] bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-black text-3xl shadow-premium">
                         {selectedMessage.firstName[0]}{selectedMessage.lastName[0]}
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight">{selectedMessage.firstName} {selectedMessage.lastName}</h3>
                         <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><FiMail className="text-primary-500"/> {selectedMessage.email}</span>
                            {selectedMessage.phone && <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><FiPhone className="text-emerald-500"/> {selectedMessage.phone}</span>}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedMessage.status === 'unread' ? 'bg-primary-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Statut : {selectedMessage.status}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/10 flex items-center gap-2"><FiTag /> Business Inquiry</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2"><FiCalendar /> {format(new Date(selectedMessage.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}</span>
                   </div>
                   <div className="p-10 rounded-[32px] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/10 group hover:border-primary-500/20 transition-all relative">
                      <div className="absolute top-6 right-6 text-slate-100 dark:text-white/5 pointer-events-none"><FiInbox size={64} /></div>
                      <h4 className="text-lg font-black dark:text-white text-slate-900 mb-6 uppercase tracking-tight">RE: {selectedMessage.subject}</h4>
                      <div className="text-sm dark:text-slate-300 text-slate-700 italic leading-relaxed whitespace-pre-wrap px-4 border-l-2 border-primary-500/30">
                         "{selectedMessage.message}"
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                   <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`} className="flex-1 bg-primary-500 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/25 transition-all text-center flex items-center justify-center gap-3 hover:bg-primary-600"><FiSend /> Répondre par mail</a>
                   <div className="flex gap-4">
                      <button onClick={() => updateMessageStatus(selectedMessage._id, 'archived')} className="px-8 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-white hover:bg-amber-500 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all grow sm:grow-0 shadow-sm"><FiArchive /></button>
                      <button onClick={() => deleteMessage(selectedMessage._id)} className="px-8 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-white hover:bg-rose-500 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all grow sm:grow-0 shadow-sm"><FiTrash2 /></button>
                   </div>
                </div>
             </div>
           )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
