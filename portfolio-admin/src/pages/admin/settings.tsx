import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiSave, 
  FiEdit3, 
  FiMail, 
  FiGithub, 
  FiLinkedin, 
  FiTwitter, 
  FiFileText,
  FiSettings,
  FiPhone,
  FiMapPin,
  FiUpload,
  FiDownload,
  FiTrash2
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

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
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return {
      siteTitle: '',
      siteDescription: '',
      email: '',
      phone: '',
      position: '',
      github: '',
      linkedin: '',
      twitter: '',
      whatsapp: '',
      telegram: ''
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [positionSuggestions, setPositionSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const positionInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [currentCV, setCurrentCV] = useState<any>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [selectedCVFile, setSelectedCVFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchSettings();
      fetchCurrentCV();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        localStorage.setItem('adminSettings', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchCurrentCV = async () => {
    try {
      const response = await fetch('/api/admin/cv');
      if (response.ok) {
        const data = await response.json();
        setCurrentCV(data);
      }
    } catch (error) {
      console.error('Error fetching CV:', error);
    }
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Seuls les fichiers PDF, PNG et JPEG sont acceptés');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 10MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Stocker le fichier sélectionné sans l'uploader
    setSelectedCVFile(file);
    toast('Fichier sélectionné. Cliquez sur "Save Changes" pour sauvegarder.', {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
    });
  };

  const handleCVDelete = async () => {
    if (!currentCV) return;

    try {
      const response = await fetch('/api/admin/cv', {
        method: 'DELETE',
      });

      if (response.ok) {
        setCurrentCV(null);
        toast.success('CV supprimé avec succès!');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCVDownload = () => {
    if (currentCV) {
      window.open(`/uploads/cv/${currentCV.filename}`, '_blank');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newSettings = {
      ...settings,
      [name]: value
    };
    setSettings(newSettings);
    
    // Auto-complétion pour le champ position
    if (name === 'position' && value.length >= 2) {
      searchAddresses(value);
    } else if (name === 'position' && value.length < 2) {
      setPositionSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fonction pour rechercher des adresses
  const searchAddresses = async (query: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (data.features) {
        const suggestions = data.features.map((feature: any) => {
          const city = feature.properties.city;
          const postcode = feature.properties.postcode;
          return `${city}, ${postcode}`;
        });
        setPositionSuggestions(suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresses:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: string) => {
    const newSettings = {
      ...settings,
      position: suggestion
    };
    setSettings(newSettings);
    setShowSuggestions(false);
    setPositionSuggestions([]);
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          positionInputRef.current && !positionInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Sauvegarder les paramètres
      const settingsResponse = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!settingsResponse.ok) {
        toast.error('Failed to update settings');
        return;
      }
      
      // Uploader le CV si un fichier a été sélectionné
      if (selectedCVFile) {
        setIsUploadingCV(true);
        const formData = new FormData();
        formData.append('cv', selectedCVFile);
        
        const cvResponse = await fetch('/api/admin/cv', {
          method: 'POST',
          body: formData,
        });
        
        if (cvResponse.ok) {
          const data = await cvResponse.json();
          setCurrentCV(data.cv);
          setSelectedCVFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          toast.error('Erreur lors de l\'upload du CV');
          return;
        }
      }
      
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast.success('Settings updated successfully!');
      
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
      setIsUploadingCV(false);
    }
  };

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <FiSettings className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isSaving}
          >
            <FiSave className="mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E1E1E] rounded-lg shadow-lg"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiEdit3 className="text-blue-500" />
                    Site Title
                  </div>
                </label>
                <input
                  type="text"
                  name="siteTitle"
                  value={settings.siteTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-blue-500" />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-blue-500" />
                    Phone Number
                  </div>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="relative"
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-blue-500" />
                    Position
                    {isLoadingSuggestions && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                  </div>
                </label>
                <input
                  ref={positionInputRef}
                  type="text"
                  name="position"
                  value={settings.position}
                  onChange={handleChange}
                  placeholder="Ex: Nogent-sur-Oise, 60180"
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoComplete="off"
                />
                {showSuggestions && positionSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-[#252525] border border-[#2A2A2A] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {positionSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="px-3 py-2 text-white hover:bg-[#2A2A2A] cursor-pointer border-b border-[#2A2A2A] last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-blue-500 text-sm" />
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Tapez au moins 2 caractères pour voir les suggestions d'adresses françaises
                </p>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiGithub className="text-blue-500" />
                    GitHub URL
                  </div>
                </label>
                <input
                  type="url"
                  name="github"
                  value={settings.github}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiLinkedin className="text-blue-500" />
                    LinkedIn URL
                  </div>
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={settings.linkedin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiTwitter className="text-blue-500" />
                    Twitter URL
                  </div>
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={settings.twitter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FaWhatsapp className="text-blue-500" />
                    WhatsApp URL
                  </div>
                </label>
                <input
                  type="url"
                  name="whatsapp"
                  value={settings.whatsapp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FaTelegram className="text-blue-500" />
                    Telegram URL
                  </div>
                </label>
                <input
                  type="url"
                  name="telegram"
                  value={settings.telegram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-blue-500" />
                  Site Description
                </div>
              </label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </motion.div>

            {/* Section CV */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="col-span-1 md:col-span-2"
            >
              <label className="block text-gray-400 text-sm font-medium mb-4">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-blue-500" />
                  CV / Curriculum Vitae
                </div>
              </label>
              
              <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A]">
                {/* CV actuel */}
                {currentCV && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">CV actuel :</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <FiFileText className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{currentCV.originalName}</p>
                          <p className="text-gray-400 text-sm">
                            {(currentCV.size / 1024 / 1024).toFixed(2)} MB • 
                            {new Date(currentCV.uploadDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCVDownload}
                          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          title="Télécharger"
                        >
                          <FiDownload className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCVDelete}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Fichier sélectionné en attente */}
                {selectedCVFile && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 text-sm mb-2">Nouveau fichier sélectionné (en attente de sauvegarde) :</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <FiFileText className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{selectedCVFile.name}</p>
                          <p className="text-gray-400 text-sm">
                            {(selectedCVFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedCVFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Annuler la sélection"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                )}
                
                {/* Bouton de sélection */}
                {!currentCV && !selectedCVFile ? (
                  <div className="text-center py-8">
                    <FiUpload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Aucun CV uploadé</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Choisir un fichier
                    </motion.button>
                  </div>
                ) : (
                  <div className={currentCV ? "pt-4 border-t border-[#3A3A3A]" : ""}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      {selectedCVFile ? 'Choisir un autre fichier' : (currentCV ? 'Remplacer le CV' : 'Choisir un fichier')}
                    </motion.button>
                  </div>
                )}
                

                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleCVUpload}
                  className="hidden"
                />
                
                <p className="text-gray-500 text-xs mt-2">
                  Formats acceptés: PDF, PNG, JPEG • Taille max: 10MB
                </p>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
