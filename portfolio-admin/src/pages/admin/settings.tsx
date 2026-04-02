import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSave, FiEdit3, FiMail, FiGithub, FiLinkedin, FiTwitter, FiFileText, FiSettings, FiPhone, FiMapPin, FiUpload, FiFile, FiTrash2, FiEye, FiUser, FiZap, FiLoader, FiGlobe, FiBriefcase, FiCalendar, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Settings {
  siteTitle: string;
  siteDescription: string;
  email: string;
  phone: string;
  position: string;
  github: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
  telegram: string;
  aboutTitle: string;
  aboutBio: string;
  aboutImage: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({ siteTitle: '', siteDescription: '', email: '', phone: '', position: '', github: '', linkedin: '', twitter: '', whatsapp: '', telegram: '', aboutTitle: '', aboutBio: '', aboutImage: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [positionSuggestions, setPositionSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const positionInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [currentCV, setCurrentCV] = useState<any>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => { if (status === 'unauthenticated') { router.push('/admin/login'); } else if (status === 'authenticated') { fetchSettings(); fetchCurrentCV(); } }, [status, router]);

  const fetchSettings = async () => {
    try { const res = await fetch('/api/admin/settings'); if (res.ok) { const d = await res.json(); setSettings(d); } } catch (e) { console.error(e); }
  };

  const fetchCurrentCV = async () => {
    try { const res = await fetch('/api/admin/cv'); if (res.ok) { const d = await res.json(); setCurrentCV(d); } } catch (e) { console.error(e); }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setIsUploadingCV(true);
    const fd = new FormData(); fd.append('cv', f);
    try {
      const res = await fetch('/api/admin/cv', { method: 'POST', body: fd });
      if (res.ok) { const d = await res.json(); setCurrentCV(d.cv); toast.success('CV uploadé'); } else { toast.error('Erreur upload'); }
    } catch (e) { toast.error('Erreur upload'); } finally { setIsUploadingCV(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDeleteCV = async () => {
    if (!currentCV || !confirm('Supprimer ce CV ?')) return;
    try { const res = await fetch('/api/admin/cv', { method: 'DELETE' }); if (res.ok) { setCurrentCV(null); toast.success('CV supprimé'); } } catch (e) { toast.error('Erreur'); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const [isPositionFocused, setIsPositionFocused] = useState(false);
  useEffect(() => {
    const query = settings.position.trim();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isPositionFocused || query.length < 2) { setPositionSuggestions([]); setShowSuggestions(false); return; }
    timeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=8`);
        const d = await res.json();
        const s = d.features?.map((f: any) => f.properties.postcode ? `${f.properties.name}, ${f.properties.postcode}` : f.properties.name) || [];
        setPositionSuggestions(s); setShowSuggestions(s.length > 0);
      } catch (e) { console.error(e); } finally { setIsLoadingSuggestions(false); }
    }, 300);
  }, [settings.position, isPositionFocused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (res.ok) toast.success('Enregistré'); else toast.error('Erreur');
    } catch (e) { toast.error('Erreur'); } finally { setIsSaving(false); }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const r = new FileReader(); r.onload = () => { setImageSrc(r.result as string); setIsCropping(true); };
      r.readAsDataURL(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const b = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (b) {
        const reader = new FileReader(); reader.onloadend = () => setSettings({ ...settings, aboutImage: reader.result as string }); reader.readAsDataURL(b);
        setIsCropping(false); setImageSrc(null); toast.success('Image prête à être sauvegardée');
      }
    } catch (e) { toast.error('Erreur crop'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiSettings className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Global Configuration</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Settings</h1>
             <p className="text-slate-500 font-medium max-w-lg">Gérez votre identité numérique, vos réseaux et vos documents officiels.</p>
           </div>
           
           <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/25 border border-primary-400 flex items-center gap-2 hover:bg-primary-600 transition-all disabled:opacity-50">
              {isSaving ? <FiLoader className="animate-spin" /> : <FiSave className="w-4 h-4" />} Tout Enregistrer
           </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
           {/* Left Column: Profile & Info */}
           <div className="xl:col-span-8 space-y-10">
              {/* Profile Box */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 group hover:shadow-premium-lg transition-all duration-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl -mr-16 -mt-16" />
                 <div className="flex items-center gap-10">
                    <div className="relative group/avatar">
                       <div className="w-32 h-32 rounded-[32px] overflow-hidden bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 shadow-premium flex items-center justify-center">
                          {settings.aboutImage ? <Image src={settings.aboutImage} alt="Profile" fill className="object-cover" /> : <FiUser size={48} className="text-slate-300 dark:text-slate-600" />}
                       </div>
                       <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-600 transition-all scale-0 group-hover/avatar:scale-100">
                          <FiUpload size={16} />
                          <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                       </label>
                    </div>
                    <div className="space-y-4 flex-1">
                       <div>
                          <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Identité Visuelle</h2>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo de profil & Bio rapide</p>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Titre public (SEO)</label>
                          <input name="siteTitle" value={settings.siteTitle} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Bio Detail */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm"><FiFileText className="w-6 h-6" /></div>
                    <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Parcours & Narrative</h3>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Biographie Complète</label>
                    <div className="rounded-3xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                       <ReactQuill theme="snow" value={settings.aboutBio} onChange={v => setSettings({ ...settings, aboutBio: v })} className="min-h-[300px] text-slate-300" />
                    </div>
                 </div>
              </div>

              {/* Global SEO */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 space-y-6">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-sm"><FiGlobe className="w-6 h-6" /></div>
                    <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Indexation & SEO</h3>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Méta Description Globale</label>
                    <textarea name="siteDescription" value={settings.siteDescription} onChange={handleChange} rows={3} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none" placeholder="Apparaît sous votre nom dans Google…" />
                 </div>
              </div>
           </div>

           {/* Right Column: Contact, Social, CV */}
           <div className="xl:col-span-4 space-y-10">
              {/* Localisation Box */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500"><FiMapPin className="w-5 h-5" /></div>
                    <h3 className="font-extrabold dark:text-white text-slate-900 tracking-tight text-lg uppercase">Localisation</h3>
                 </div>
                 <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Ville (France)</label>
                    <input ref={positionInputRef} type="text" name="position" value={settings.position} onChange={handleChange} onFocus={() => setIsPositionFocused(true)} onBlur={() => setTimeout(() => { setIsPositionFocused(false); setShowSuggestions(false); }, 200)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-5 py-3 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-xs mt-2" placeholder="Ex: Paris 75010…" />
                    {showSuggestions && (
                       <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0d0d12] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2" ref={suggestionsRef}>
                          {positionSuggestions.map((s, i) => (
                             <div key={i} onClick={() => { setSettings({ ...settings, position: s }); setShowSuggestions(false); }} className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-primary-500/10 hover:text-primary-500 cursor-pointer transition-colors flex items-center gap-3">
                                <span>🇫🇷</span> {s}
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              </div>

              {/* Contact Box */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 space-y-6">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><FiMail className="w-5 h-5" /></div>
                    <h3 className="font-extrabold dark:text-white text-slate-900 tracking-tight text-lg uppercase">Contact</h3>
                 </div>
                 {[
                   { icon: FiMail, label: 'Email', name: 'email', type: 'email' },
                   { icon: FiPhone, label: 'Phone', name: 'phone', type: 'tel' },
                 ].map(f => (
                    <div key={f.name} className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                       <div className="relative group">
                          <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input type={f.type} name={f.name} value={(settings as any)[f.name]} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-10 py-3 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold dark:text-white text-slate-900 text-xs" />
                       </div>
                    </div>
                 ))}
              </div>

              {/* CV Manager */}
              <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 space-y-6 group">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><FiFile className="w-5 h-5" /></div>
                    <h3 className="font-extrabold dark:text-white text-slate-900 tracking-tight text-lg uppercase">Curriculum Vitae</h3>
                 </div>
                 {currentCV ? (
                    <div className="space-y-4">
                       <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500 shadow-sm"><FiCheck /></div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-[10px] font-black text-slate-400 uppercase truncate">{currentCV.originalName}</p>
                             <p className="text-[9px] font-bold text-emerald-500">{(currentCV.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button type="button" onClick={handleDeleteCV} className="flex-1 bg-slate-50 dark:bg-white/5 py-2.5 rounded-xl text-[10px] font-black uppercase text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">Supprimer</button>
                          <a href="/cv" target="_blank" className="flex-1 bg-emerald-500 py-2.5 rounded-xl text-[10px] font-black uppercase text-white hover:bg-emerald-600 transition-all text-center shadow-lg shadow-emerald-500/20">Voir</a>
                       </div>
                    </div>
                 ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[28px] p-10 text-center space-y-4 hover:border-emerald-500/30 transition-all">
                       <FiFile className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun CV chargé</p>
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20">Charger</button>
                       </div>
                    </div>
                 )}
                 <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleCVUpload} className="hidden" />
              </div>
           </div>
        </form>
      </div>

      {/* Image Cropper Modal */}
      <AnimatePresence>
         {isCropping && imageSrc && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
               <div className="bg-white dark:bg-[#0f0f15] border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative">
                  <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                     <h3 className="text-xl font-black dark:text-white text-slate-900 uppercase tracking-tight">Recadrer la photo</h3>
                     <button onClick={() => setIsCropping(false)} className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-2xl text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center"><FiX size={24} /></button>
                  </div>
                  <div className="relative h-80 w-full bg-slate-950">
                     <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(a, p) => setCroppedAreaPixels(p)} onZoomChange={setZoom} />
                  </div>
                  <div className="p-8 space-y-8 bg-slate-50 dark:bg-zinc-900/40">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">Zoom <span>{Math.round(zoom * 100)}%</span></label>
                        <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-primary-500" />
                     </div>
                     <div className="flex justify-end gap-4">
                        <button onClick={() => setIsCropping(false)} className="px-8 py-4 bg-slate-200 dark:bg-white/5 rounded-[24px] text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">Annuler</button>
                        <button onClick={handleSaveCrop} className="px-10 py-4 bg-primary-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20">Valider</button>
                     </div>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </AdminLayout>
  );
}
