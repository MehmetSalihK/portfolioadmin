import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiBook, FiMapPin, FiFileText, FiExternalLink, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BlurPreview from '../BlurPreview';
import Modal from '../admin/Modal';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  education?: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description: string;
    location: string;
    isCurrentlyStudying?: boolean;
    isPaused?: boolean;
    isDiplomaPassed?: boolean;
    isDiplomaNotObtained?: boolean;
    isVisible?: boolean;
    diplomaFile?: string;
    diplomaFileName?: string;
    diplomaFilePath?: string;
  };
}

export default function EducationModal({ isOpen, onClose, onSubmit, education }: EducationModalProps) {
  // Fonction pour formater une date en format YYYY-MM pour les inputs de type month
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [formData, setFormData] = useState({
    school: education?.school || '',
    degree: education?.degree || '',
    field: education?.field || '',
    startDate: formatDateForInput(education?.startDate || '') || '',
    endDate: formatDateForInput(education?.endDate || '') || '',
    description: education?.description || '',
    location: education?.location || '',
    isCurrentlyStudying: education?.isCurrentlyStudying || false,
    isPaused: education?.isPaused || false,
    isDiplomaPassed: education?.isDiplomaPassed || false,
    isDiplomaNotObtained: education?.isDiplomaNotObtained || false,
    isVisible: education?.isVisible !== undefined ? education.isVisible : true,
    diplomaFile: education?.diplomaFile || '',
    diplomaFileName: education?.diplomaFileName || '',
    diplomaFilePath: education?.diplomaFilePath || ''
  });
  const [showBlurPreview, setShowBlurPreview] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Ajout de useEffect pour mettre à jour le formulaire quand education change
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
      // Réinitialiser le formulaire si pas d'éducation
      setFormData({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
        location: '',
        isCurrentlyStudying: false,
        isPaused: false,
        isDiplomaPassed: false,
        isDiplomaNotObtained: false,
        isVisible: true,
        diplomaFile: '',
        diplomaFileName: '',
        diplomaFilePath: ''
      });
    }
  }, [education]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Seuls PDF, JPEG et PNG sont acceptés.');
      return;
    }

    // Validation de la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux. Taille maximale : 50MB.');
      return;
    }

    // Stocker le fichier sans ouvrir automatiquement le BlurPreview
    setPendingFile(file);
  };

  const uploadFile = async (file: File, blurZones?: any[]) => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      // Ajouter les zones de floutage si c'est une image
      if (blurZones && file.type.startsWith('image/')) {
        uploadFormData.append('blurZones', JSON.stringify(blurZones));
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const data = await response.json();
      
      setFormData(prev => ({
         ...prev,
         diplomaFile: data.filePath,
         diplomaFileName: data.filename,
         diplomaFilePath: data.filePath
       }));

      toast.success('Certificat téléchargé avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du téléchargement du certificat');
    }
  };

  const handleBlurConfirm = async (blurZones: any[]) => {
    if (pendingFile) {
      await uploadFile(pendingFile, blurZones);
      setPendingFile(null);
    }
    setShowBlurPreview(false);
  };

  const handleBlurCancel = () => {
    setShowBlurPreview(false);
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={education ? 'Modifier la formation' : 'Nouvelle formation'}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">École / Établissement</label>
              <div className="relative group">
                <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full bg-white/5 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: Université Paris-Saclay"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Diplôme</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: Master"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Domaine d'études</label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: Informatique"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Localisation</label>
              <div className="relative group">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/5 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300"
                  placeholder="Ex: Paris, France"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Date de début</label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-white/10 transition-all duration-300 [color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Date de fin</label>
                <input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border transition-all duration-300 [color-scheme:dark]
                    ${formData.isCurrentlyStudying 
                      ? 'bg-zinc-900/50 text-zinc-600 border-white/5 cursor-not-allowed' 
                      : 'bg-white/5 text-white border-white/10'
                    }`}
                  disabled={formData.isCurrentlyStudying}
                />
                <div className="mt-4 flex flex-wrap gap-4">
                  <label className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 cursor-pointer group hover:border-indigo-500/30 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isCurrentlyStudying}
                      disabled={formData.isDiplomaPassed || formData.isDiplomaNotObtained || formData.isPaused}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          isCurrentlyStudying: e.target.checked,
                          endDate: e.target.checked ? '' : formData.endDate,
                          isPaused: e.target.checked ? false : formData.isPaused,
                          isDiplomaPassed: e.target.checked ? false : formData.isDiplomaPassed,
                          isDiplomaNotObtained: e.target.checked ? false : formData.isDiplomaNotObtained
                        });
                      }}
                      className="w-4 h-4 text-indigo-500 bg-zinc-800 rounded border-white/10 focus:ring-indigo-500"
                    />
                    <span className={`text-xs font-bold uppercase tracking-wider ${(formData.isDiplomaPassed || formData.isDiplomaNotObtained || formData.isPaused) ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-white'}`}>En cours</span>
                  </label>
                  
                  <label className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 cursor-pointer group hover:border-indigo-500/30 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isPaused}
                      disabled={formData.isDiplomaPassed || formData.isDiplomaNotObtained || formData.isCurrentlyStudying}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          isPaused: e.target.checked,
                          endDate: e.target.checked ? '' : formData.endDate,
                          isCurrentlyStudying: e.target.checked ? false : formData.isCurrentlyStudying,
                          isDiplomaPassed: e.target.checked ? false : formData.isDiplomaPassed,
                          isDiplomaNotObtained: e.target.checked ? false : formData.isDiplomaNotObtained
                        });
                      }}
                      className="w-4 h-4 text-indigo-500 bg-zinc-800 rounded border-white/10 focus:ring-indigo-500"
                    />
                    <span className={`text-xs font-bold uppercase tracking-wider ${(formData.isDiplomaPassed || formData.isDiplomaNotObtained || formData.isCurrentlyStudying) ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-white'}`}>En pause</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-zinc-600 border border-white/10 transition-all duration-300 min-h-[120px]"
                placeholder="Décrivez votre formation et vos réalisations..."
                required
              />
            </div>

            <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 group hover:border-indigo-500/30 transition-all duration-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-5 h-5 text-indigo-500 bg-zinc-800 rounded-lg border-white/10 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">Afficher sur la page publique</span>
                  <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Visibilité immédiate pour les visiteurs.</p>
                </div>
              </label>
            </div>

            <div className="pt-6 border-t border-border-subtle">
              <div className="flex flex-wrap gap-4 mb-6">
                <label className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 cursor-pointer group hover:border-emerald-500/30 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.isDiplomaPassed}
                    disabled={formData.isCurrentlyStudying || formData.isDiplomaNotObtained || formData.isPaused}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isDiplomaPassed: e.target.checked,
                      isCurrentlyStudying: e.target.checked ? false : formData.isCurrentlyStudying,
                      isPaused: e.target.checked ? false : formData.isPaused,
                      isDiplomaNotObtained: e.target.checked ? false : formData.isDiplomaNotObtained
                    })}
                    className="w-4 h-4 text-emerald-500 bg-zinc-800 rounded border-white/10 focus:ring-emerald-500"
                  />
                  <span className={`text-xs font-bold uppercase tracking-wider ${(formData.isCurrentlyStudying || formData.isDiplomaNotObtained || formData.isPaused) ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-white'}`}>Diplôme obtenu</span>
                </label>
                
                <label className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 cursor-pointer group hover:border-rose-500/30 transition-all">
                   <input
                     type="checkbox"
                     checked={formData.isDiplomaNotObtained}
                     disabled={formData.isCurrentlyStudying || formData.isDiplomaPassed || formData.isPaused}
                     onChange={(e) => setFormData({ 
                       ...formData, 
                       isDiplomaNotObtained: e.target.checked,
                       isCurrentlyStudying: e.target.checked ? false : formData.isCurrentlyStudying,
                       isPaused: e.target.checked ? false : formData.isPaused,
                       isDiplomaPassed: e.target.checked ? false : formData.isDiplomaPassed
                     })}
                     className="w-4 h-4 text-rose-500 bg-zinc-800 rounded border-white/10 focus:ring-rose-500"
                   />
                   <span className={`text-xs font-bold uppercase tracking-wider ${(formData.isCurrentlyStudying || formData.isDiplomaPassed || formData.isPaused) ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-white'}`}>Non obtenu</span>
                 </label>
              </div>

              {formData.isDiplomaPassed && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Certificat de diplôme</label>
                  
                  {/* Zone de téléchargement */}
                  <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 group">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiUploadCloud className="w-6 h-6 text-indigo-400" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">Cliquer ou glisser le fichier</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">PDF, JPEG, PNG (MAX. 50MB)</p>
                    </div>
                  </div>

                  {/* Affichage du fichier en attente */}
                  {pendingFile && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-amber-400 w-5 h-5" />
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[200px]">{pendingFile.name}</p>
                          <p className="text-[10px] text-amber-500 uppercase font-black tracking-widest mt-0.5">En attente de traitement</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBlurPreview(true)}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Flouter
                        </button>
                        <button
                          type="button"
                          onClick={() => uploadFile(pendingFile)}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Envoyer
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingFile(null)}
                          className="p-1.5 text-zinc-500 hover:text-rose-500 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Affichage du fichier actuel */}
                  {formData.diplomaFileName && formData.diplomaFilePath && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-emerald-400 w-5 h-5" />
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[200px]">{formData.diplomaFileName}</p>
                          <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mt-0.5">Certificat validé</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button
                          type="button"
                          onClick={() => setShowBlurPreview(true)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Flouter
                        </button>
                        <a
                          href={formData.diplomaFilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              diplomaFile: '',
                              diplomaFileName: '',
                              diplomaFilePath: ''
                            }));
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-500 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider active:scale-95 border border-indigo-500"
            >
              {education ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
      
      {showBlurPreview && (pendingFile || formData.diplomaFilePath) && (
        <BlurPreview
          file={pendingFile || (formData.diplomaFilePath ? new File([], formData.diplomaFileName || 'file') : null)}
          fileUrl={pendingFile ? undefined : formData.diplomaFilePath}
          onConfirm={handleBlurConfirm}
          onCancel={handleBlurCancel}
        />
      )}
    </>
  );
}