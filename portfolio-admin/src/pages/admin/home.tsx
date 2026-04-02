import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import LivePreview from '@/components/LivePreview';
import { usePreviewSync } from '@/hooks/usePreviewSync';
import { getPreviewUrl } from '@/utils/getBaseUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiEdit3, FiGlobe, FiEye, FiZap, FiSave, FiGithub, FiLinkedin, FiTwitter, FiPhone, FiMessageCircle, FiLoader, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

interface HomePageData {
  _id?: string;
  title: string;
  subtitle: string;
  aboutTitle: string;
  aboutText: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    whatsapp: string;
    telegram: string;
  };
}

const defaultData: HomePageData = {
  title: 'Portfolio Professionnel',
  subtitle: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes.',
  aboutTitle: 'À propos',
  aboutText: 'Je suis un développeur Full Stack passionné…',
  socialLinks: { github: '', linkedin: '', twitter: '', whatsapp: '', telegram: '' }
};

export default function HomePageAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<HomePageData>(defaultData);
  const [showPreview, setShowPreview] = useState(false);
  const { notifyChange, isConnected } = usePreviewSync();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/homepage');
      if (!response.ok) throw new Error('Erreur');
      const fetchedData = await response.json();
      setData({ ...defaultData, ...fetchedData, socialLinks: { ...defaultData.socialLinks, ...(fetchedData.socialLinks || {}) } });
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur');
      toast.success('Modifications enregistrées');
      notifyChange('homepage-update');
    } catch (error) {
      toast.error('Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [socialKey]: value } }));
    } else {
      setData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
           <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-4">Chargement de l'accueil…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiHome className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Point d'Entrée</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Accueil & Hero</h1>
             <p className="text-slate-500 font-medium max-w-lg">Gérez la première impression que vos visiteurs auront en arrivant sur votre portfolio.</p>
           </div>

           <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 border ${showPreview ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}
              >
                <FiEye className="w-4 h-4" /> Prévisualisation
                {isConnected && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 border border-primary-400 hover:bg-primary-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <FiLoader className="animate-spin" /> : <FiSave className="w-5 h-5" />} Enregistrer
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
           {/* Section Hero */}
           <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-10 group hover:shadow-premium-lg transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                    <FiZap className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Section Hero</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accroche principale & SEO</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Titre d'impact</label>
                    <input name="title" value={data.title} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: Développeur Fullstack" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Paragraphe d'appui</label>
                    <textarea name="subtitle" value={data.subtitle} onChange={handleChange} rows={4} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none" placeholder="Décrivez votre valeur ajoutée…" />
                 </div>
              </div>
           </div>

           {/* Liens Sociaux */}
           <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-10 group hover:shadow-premium-lg transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <FiGlobe className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Social Network</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connectivité & Réseaux</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { icon: FiGithub, label: 'GitHub', name: 'socialLinks.github' },
                   { icon: FiLinkedin, label: 'LinkedIn', name: 'socialLinks.linkedin' },
                   { icon: FiTwitter, label: 'Twitter', name: 'socialLinks.twitter' },
                   { icon: FaWhatsapp, label: 'WhatsApp', name: 'socialLinks.whatsapp' },
                   { icon: FaTelegram, label: 'Telegram', name: 'socialLinks.telegram' },
                 ].map(social => (
                    <div key={social.name} className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{social.label}</label>
                       <div className="relative group">
                          <social.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input name={social.name} value={(data.socialLinks as any)[social.name.split('.')[1]]} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-11 py-3 text-xs rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 placeholder:text-slate-300" placeholder="https://…" />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Section À propos */}
           <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-10 xl:col-span-2 group hover:shadow-premium-lg transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <FiEdit3 className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Presentation Detail</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narration & Histoire Personnelle</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Titre de présentation</label>
                    <input name="aboutTitle" value={data.aboutTitle} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: Qui je suis ?" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Corps de texte (Riche)</label>
                    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                       <RichTextEditor
                          content={data.aboutText}
                          onChange={(content) => setData(prev => ({ ...prev, aboutText: content }))}
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <LivePreview
        isVisible={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
        previewUrl={getPreviewUrl()}
        autoRefresh={isConnected}
        refreshInterval={2000}
      />
    </AdminLayout>
  );
}
