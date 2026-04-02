import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiBook, FiMapPin, FiFileText, FiExternalLink, FiTrash2, FiUploadCloud, FiCheck, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BlurPreview from '../BlurPreview';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  education?: any;
}

export default function EducationModal({ isOpen, onClose, onSubmit, education }: EducationModalProps) {
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [formData, setFormData] = useState({
    school: '', degree: '', field: '', startDate: '', endDate: '',
    description: '', location: '', isCurrentlyStudying: false,
    isPaused: false, isDiplomaPassed: false, isDiplomaNotObtained: false,
    isVisible: true, diplomaFile: '', diplomaFileName: '', diplomaFilePath: ''
  });
  
  const [showBlurPreview, setShowBlurPreview] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (education) {
      setFormData({
        school: education.school || '',
        degree: education.degree || '',
        field: education.field || '',
        startDate: formatDateForInput(education.startDate) || '',
        endDate: formatDateForInput(education.endDate || '') || '',
        description: education.description || '',
        location: education.location || '',
        isCurrentlyStudying: education.isCurrentlyStudying || false,
        isPaused: education.isPaused || false,
        isDiplomaPassed: education.isDiplomaPassed || false,
        isDiplomaNotObtained: education.isDiplomaNotObtained || false,
        isVisible: education.isVisible !== undefined ? education.isVisible : true,
        diplomaFile: education.diplomaFile || '',
        diplomaFileName: education.diplomaFileName || '',
        diplomaFilePath: education.diplomaFilePath || ''
      });
    } else {
      setFormData({
        school: '', degree: '', field: '', startDate: '', endDate: '',
        description: '', location: '', isCurrentlyStudying: false,
        isPaused: false, isDiplomaPassed: false, isDiplomaNotObtained: false,
        isVisible: true, diplomaFile: '', diplomaFileName: '', diplomaFilePath: ''
      });
    }
  }, [education, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast.error('Fichier trop volumineux (50MB max)');
    setPendingFile(file);
  };

  const uploadFile = async (file: File, blurZones?: any[]) => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      if (blurZones && file.type.startsWith('image/')) fd.append('blurZones', JSON.stringify(blurZones));
      const response = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!response.ok) throw new Error('Upload error');
      const data = await response.json();
      setFormData(prev => ({ ...prev, diplomaFile: data.filePath, diplomaFileName: data.filename, diplomaFilePath: data.filePath }));
      toast.success('Certificat téléchargé !');
    } catch (e) { toast.error('Erreur d\'upload'); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={onClose}>
           <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#0f0f15] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{education ? 'Édition' : 'Ajout'}</span>
                    <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900">Formation</h2>
                 </div>
                 <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><FiX className="w-6 h-6"/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Établissement</label>
                    <div className="relative group">
                       <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input required value={formData.school} onChange={e => setFormData({ ...formData, school: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: HEC Paris" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Diplôme</label>
                       <input required value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: Master II" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Spécialisation</label>
                       <input required value={formData.field} onChange={e => setFormData({ ...formData, field: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: Architecture logicielle" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Début</label>
                       <input type="month" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fin</label>
                       <input type="month" disabled={formData.isCurrentlyStudying} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm [color-scheme:dark] disabled:opacity-30 disabled:grayscale" />
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-3">
                    {[ { label: 'En cours', key: 'isCurrentlyStudying' }, { label: 'En pause', key: 'isPaused' } ].map(opt => (
                       <label key={opt.key} className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl cursor-pointer group hover:border-primary-500/30 transition-all">
                          <input type="checkbox" checked={formData[opt.key as keyof typeof formData] as boolean} onChange={e => setFormData({ ...formData, [opt.key]: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })} className="w-4 h-4 accent-primary-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary-500">{opt.label}</span>
                       </label>
                    ))}
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                    <textarea rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm resize-none" placeholder="Décrivez votre cursus…" />
                 </div>

                 <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-6">
                    <div className="flex flex-wrap gap-3">
                       {[ { label: 'Diplôme obtenu', key: 'isDiplomaPassed', color: 'emerald' }, { label: 'Non obtenu', key: 'isDiplomaNotObtained', color: 'rose' } ].map(opt => (
                          <label key={opt.key} className={`flex items-center gap-3 px-4 py-2 rounded-2xl cursor-pointer border transition-all ${formData[opt.key as keyof typeof formData] ? `bg-${opt.color}-500/10 border-${opt.color}-500/50` : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
                             <input type="checkbox" checked={formData[opt.key as keyof typeof formData] as boolean} onChange={e => setFormData({ ...formData, [opt.key]: e.target.checked })} className={`w-4 h-4 accent-${opt.color}-500`} />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{opt.label}</span>
                          </label>
                       ))}
                    </div>

                    {formData.isDiplomaPassed && (
                      <div className="space-y-4">
                         <label className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[32px] cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                            <FiUploadCloud className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Importer le certificat</p>
                            <input type="file" onChange={handleFileUpload} className="hidden" />
                         </label>
                         
                         {(pendingFile || formData.diplomaFileName) && (
                           <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                              <div className="flex items-center gap-3">
                                 <FiFileText className="text-emerald-500" />
                                 <span className="text-xs font-bold dark:text-white text-slate-900 truncate max-w-[200px]">{pendingFile?.name || formData.diplomaFileName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 {pendingFile && <button type="button" onClick={() => uploadFile(pendingFile)} className="bg-emerald-500 text-white p-2 rounded-lg"><FiCheckCircle /></button>}
                                 <button type="button" onClick={() => { setPendingFile(null); setFormData(p => ({ ...p, diplomaFile: '', diplomaFileName: '', diplomaFilePath: '' })); }} className="text-rose-500 p-2"><FiTrash2 /></button>
                              </div>
                           </div>
                         )}
                      </div>
                    )}
                 </div>

                 <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                    <button type="submit" disabled={isLoading} className="flex-1 bg-primary-500 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                      {isLoading ? <FiLoader className="animate-spin" /> : <FiCheck className="w-5 h-5" />} Confirmer
                    </button>
                    <button type="button" onClick={onClose} className="px-8 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-[24px] font-black uppercase text-sm transition-all tracking-widest">Annuler</button>
                 </div>
              </form>
           </motion.div>
        </motion.div>
      )}

      {showBlurPreview && pendingFile && (
        <BlurPreview file={pendingFile} onConfirm={handleBlurConfirm} onCancel={() => setShowBlurPreview(false)} />
      )}
    </AnimatePresence>
  );
}