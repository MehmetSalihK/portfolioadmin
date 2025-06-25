import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCalendar, FiBook, FiMapPin, FiFileText, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BlurPreview from '../BlurPreview';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  education?: {
    _id?: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description: string;
    location: string;
    isCurrentlyStudying?: boolean;
    isDiplomaPassed?: boolean;
    isDiplomaNotObtained?: boolean;
    diplomaFile?: string;
    diplomaFileName?: string;
    diplomaFilePath?: string;
    diplomaData?: string;
    isBlurred?: boolean;
  };
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
    school: education?.school || '',
    degree: education?.degree || '',
    field: education?.field || '',
    startDate: formatDateForInput(education?.startDate || '') || '',
    endDate: formatDateForInput(education?.endDate || '') || '',
    description: education?.description || '',
    location: education?.location || '',
    isCurrentlyStudying: education?.isCurrentlyStudying || false,
    isDiplomaPassed: education?.isDiplomaPassed || false,
    isDiplomaNotObtained: education?.isDiplomaNotObtained || false,
    diplomaFile: education?.diplomaFile || '',
    diplomaFileName: education?.diplomaFileName || '',
    diplomaFilePath: education?.diplomaFilePath || '',
    diplomaData: education?.diplomaData || '',
    isBlurred: education?.isBlurred || false
  });
  const [showBlurPreview, setShowBlurPreview] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

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
        isDiplomaPassed: education.isDiplomaPassed || false,
        isDiplomaNotObtained: education.isDiplomaNotObtained || false,
        diplomaFile: education.diplomaFile || '',
        diplomaFileName: education.diplomaFileName || '',
        diplomaFilePath: education.diplomaFilePath || '',
        diplomaData: education.diplomaData || '',
        isBlurred: education.isBlurred || false
      });
    } else {
      setFormData({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
        location: '',
        isCurrentlyStudying: false,
        isDiplomaPassed: false,
        isDiplomaNotObtained: false,
        diplomaFile: '',
        diplomaFileName: '',
        diplomaFilePath: '',
        diplomaData: '',
        isBlurred: false
      });
    }
  }, [education, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Seuls PDF, JPEG et PNG sont acceptés.');
      return;
    }

     const maxSize = 4 * 1024 * 1024; // 4MB
     if (file.size > maxSize) {
       toast.error('Le fichier est trop volumineux. Taille maximale : 4MB.');
       return;
     }

    if (formData.diplomaFilePath) {
      await deleteFile(formData.diplomaFilePath);
    }

    setPendingFile(file);
    setFormData(prev => ({ 
      ...prev, 
      diplomaFile: '',
      diplomaFileName: '',
      diplomaFilePath: '',
      diplomaData: '',
      isBlurred: false 
    }));
    
    if (file.type.startsWith('image/')) {
      setShowBlurPreview(true);
    }
  };

  const generateFileName = (originalName: string, degree: string) => {
    const extension = originalName.split('.').pop();
    const cleanDegree = degree.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${cleanDegree || 'diplome'}.${extension}`;
  };

  const deleteFile = async (filePath: string) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la suppression du fichier');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }
  };

  const uploadFile = async (file: File, blurZones?: any[]) => {
    try {
      const uploadFormData = new FormData();
      
      const customFileName = generateFileName(file.name, formData.degree);
      const renamedFile = new File([file], customFileName, { type: file.type });
      
      uploadFormData.append('image', renamedFile);
      
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
         diplomaFilePath: data.filePath,
         diplomaData: data.fileData
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
      setFormData(prev => ({ ...prev, isBlurred: true }));
      setShowBlurPreview(false);
      setPendingFile(null);
    }
  };

  const handleUploadWithoutBlur = async () => {
    if (pendingFile) {
      await uploadFile(pendingFile);
      setPendingFile(null);
    }
  };

  const handleBlurCancel = () => {
    setShowBlurPreview(false);
  };

  return (
    <>
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1E1E1E] p-6 shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              {education ? 'Modifier la formation' : 'Nouvelle formation'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiBook className="inline-block mr-2" />
                École / Établissement
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Ex: Université Paris-Saclay"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diplôme
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Master"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domaine d'études
                </label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Informatique"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiMapPin className="inline-block mr-2" />
                Localisation
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Paris, France"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar className="inline-block mr-2" />
                  Date de début
                </label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar className="inline-block mr-2" />
                  Date de fin
                </label>
                <input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={formData.isCurrentlyStudying}
                />
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isCurrentlyStudying}
                      disabled={formData.isDiplomaPassed || formData.isDiplomaNotObtained}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          isCurrentlyStudying: e.target.checked,
                          endDate: e.target.checked ? '' : formData.endDate,
                          isDiplomaPassed: e.target.checked ? false : formData.isDiplomaPassed,
                          isDiplomaNotObtained: e.target.checked ? false : formData.isDiplomaNotObtained
                        });
                      }}
                      className="form-checkbox rounded bg-[#2A2A2A] text-blue-500 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`ml-2 text-sm ${(formData.isDiplomaPassed || formData.isDiplomaNotObtained) ? 'text-gray-500' : 'text-gray-300'}`}>En cours</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                placeholder="Décrivez votre formation..."
                required
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDiplomaPassed}
                    disabled={formData.isCurrentlyStudying || formData.isDiplomaNotObtained}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isDiplomaPassed: e.target.checked,
                      isCurrentlyStudying: e.target.checked ? false : formData.isCurrentlyStudying,
                      isDiplomaNotObtained: e.target.checked ? false : formData.isDiplomaNotObtained
                    })}
                    className="form-checkbox rounded bg-[#2A2A2A] text-blue-500 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`ml-2 text-sm ${(formData.isCurrentlyStudying || formData.isDiplomaNotObtained) ? 'text-gray-500' : 'text-gray-300'}`}>Diplôme obtenu</span>
                </label>
                
                <label className="inline-flex items-center">
                   <input
                     type="checkbox"
                     checked={formData.isDiplomaNotObtained}
                     disabled={formData.isCurrentlyStudying || formData.isDiplomaPassed}
                     onChange={(e) => setFormData({ 
                       ...formData, 
                       isDiplomaNotObtained: e.target.checked,
                       isCurrentlyStudying: e.target.checked ? false : formData.isCurrentlyStudying,
                       isDiplomaPassed: e.target.checked ? false : formData.isDiplomaPassed
                     })}
                     className="form-checkbox rounded bg-[#2A2A2A] text-blue-500 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   />
                   <span className={`ml-2 text-sm ${(formData.isCurrentlyStudying || formData.isDiplomaPassed) ? 'text-gray-500' : 'text-gray-300'}`}>Diplôme non obtenu</span>
                 </label>
              </div>

              {formData.isDiplomaPassed && (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Certificat de diplôme
                  </label>
                  
                  {/* Zone de téléchargement - masquée s'il y a déjà un fichier */}
                  {!formData.diplomaFileName && !pendingFile && (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors bg-[#1A1A1A]">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        PDF, JPEG, PNG acceptés (max 50MB)
                      </p>
                    </div>
                  )}

                  {/* Affichage du fichier en attente */}
                  {pendingFile && (
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiFileText className="text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-300">
                            {pendingFile.name} (en attente)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!formData.isBlurred && (
                            <button
                              type="button"
                              onClick={() => setShowBlurPreview(true)}
                              className="text-orange-400 hover:text-orange-300 text-sm flex items-center space-x-1"
                            >
                              <span>Flouter</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleUploadWithoutBlur}
                            className="text-green-400 hover:text-green-300 text-sm flex items-center space-x-1"
                          >
                            <span>Télécharger sans floutage</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingFile(null)}
                            className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                          >
                            <FiTrash2 size={14} />
                            <span>Annuler</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Affichage du fichier actuel */}
                  {formData.diplomaFileName && formData.diplomaFilePath && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiFileText className="text-green-400" />
                          <span className="text-sm font-medium text-green-300">
                            {formData.diplomaFileName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!formData.isBlurred && (
                            <button
                              type="button"
                              onClick={() => setShowBlurPreview(true)}
                              className="text-orange-400 hover:text-orange-300 text-sm flex items-center space-x-1"
                            >
                              <span>Flouter</span>
                            </button>
                          )}
                          <a
                            href={formData.diplomaFilePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                          >
                            <FiExternalLink size={14} />
                            <span>Voir</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = '.pdf,.jpg,.jpeg,.png';
                              fileInput.onchange = (e) => handleFileUpload(e as any);
                              fileInput.click();
                            }}
                            className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center space-x-1"
                          >
                            <span>Remplacer</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (formData.diplomaFilePath) {
                                await deleteFile(formData.diplomaFilePath);
                              }
                              
                              setFormData(prev => ({
                                ...prev,
                                diplomaFile: '',
                                diplomaFileName: '',
                                diplomaFilePath: '',
                                diplomaData: '',
                                isBlurred: false
                              }));
                            }}
                            className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                          >
                            <FiTrash2 size={14} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white bg-[#2A2A2A] rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {education ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
      
    </Dialog>
    
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