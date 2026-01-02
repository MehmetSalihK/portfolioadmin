
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  FiFile,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaUser } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

import Cropper from 'react-easy-crop';
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
      telegram: '',
      aboutTitle: 'Mon Parcours',
      aboutBio: '',
      aboutImage: ''
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // States for Image Cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

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

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Seuls les fichiers PDF, PNG et JPEG sont autorisés');
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    setIsUploadingCV(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await fetch('/api/admin/cv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCV(data.cv);
        toast.success('CV uploadé avec succès!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Erreur lors de l\'upload du CV');
    } finally {
      setIsUploadingCV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCV = async () => {
    if (!currentCV || !confirm('Êtes-vous sûr de vouloir supprimer ce CV ?')) return;

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
      toast.error('Erreur lors de la suppression du CV');
    }
  };

  const handleViewCV = () => {
    if (currentCV) {
      window.open('/cv', '_blank');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newSettings = {
      ...settings,
      [name]: value
    };
    setSettings(newSettings);
    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
  };

  // Effect-based Debounce for Position Search
  useEffect(() => {
    const query = settings.position;

    // Clear existing timer on every change
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Don't search if too short or if it's likely a selected start (optimization)
    if (!query || query.length < 2) {
      setPositionSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Set new timer
    timeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        console.log('Searching (Effect) for:', query);
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`);
        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        if (data.features) {
          const suggestions = data.features.map((feature: any) => {
            const props = feature.properties;
            if (props.city && props.postcode) {
              return `${props.city}, ${props.postcode}`;
            }
            return props.label;
          }).filter(Boolean);

          const uniqueSuggestions = Array.from(new Set(suggestions));
          setPositionSuggestions(uniqueSuggestions as string[]);
          // Only show if we have results and the input isn't exactly one of them (avoids reopening after click)
          const exactMatch = uniqueSuggestions.some(s => s === query);
          setShowSuggestions(uniqueSuggestions.length > 0 && !exactMatch);
        }
      } catch (error) {
        console.error('Erreur recherche adresse:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 400); // 400ms debounce

  }, [settings.position]);


  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: string) => {
    const newSettings = {
      ...settings,
      position: suggestion
    };
    setSettings(newSettings);
    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
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
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        toast.success('Settings updated successfully!');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  // Read file and open crop modal
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropping(true);
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (croppedImage) {
        await uploadCroppedImage(croppedImage);
        setIsCropping(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du recadrage");
    }
  };

  const uploadCroppedImage = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'profile.jpg');

    const toastId = toast.loading('Upload en cours...');

    try {
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newSettings = { ...settings, aboutImage: data.url };
        setSettings(newSettings);
        localStorage.setItem('adminSettings', JSON.stringify(newSettings));
        toast.success('Photo de profil mise à jour !', { id: toastId });
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur d'upload", { id: toastId });
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error("Erreur serveur", { id: toastId });
    }
  };

  // Deprecated/Modified original handler
  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Now delegates to onFileChange
    onFileChange(event);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="relative z-50"
              >
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-blue-500" />
                    Position
                    {isLoadingSuggestions && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                  </div>
                </label>
                <div className="relative">
                  <input
                    ref={positionInputRef}
                    type="text"
                    name="position"
                    value={settings.position}
                    onChange={handleChange}
                    placeholder="Ex: Nogent-sur-Oise, 60180"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoComplete="off"
                  />
                  {showSuggestions && positionSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                    >
                      {positionSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => selectSuggestion(suggestion)}
                          className="px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <FiMapPin className="text-blue-500 text-sm" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tapez au moins 2 caractères pour voir les suggestions de villes françaises
                </p>
                {/* DEBUG INFO: Temporary only */}
                <p className="text-[10px] text-gray-500 mt-1">
                  Debug: {isLoadingSuggestions ? 'Loading...' : 'Ready'} | Length: {positionSuggestions.length}
                </p>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
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
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

            {/* Section À Propos */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="border-t border-[#2A2A2A] pt-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Configuration "À Propos"
              </h3>

              <div className="space-y-6">
                {/* Photo Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#252525] border border-[#2A2A2A] flex-shrink-0">
                    {settings.aboutImage ? (
                      <Image
                        src={settings.aboutImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <FaUser size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Photo de Profil</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="block w-full text-sm text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-500 file:text-white
                          hover:file:bg-blue-600
                          cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommandé : Carré (500x500px min)</p>
                  </div>
                </div>

                {/* Crop Modal */}
                {isCropping && imageSrc && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                      <div className="p-4 border-b border-[#2A2A2A] flex justify-between items-center">
                        <h3 className="text-white font-semibold">Redimensionner la photo</h3>
                        <button onClick={() => setIsCropping(false)} className="text-gray-400 hover:text-white">✕</button>
                      </div>
                      <div className="relative h-96 w-full bg-black">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                        />
                      </div>
                      <div className="p-6 bg-[#1e1e1e] border-t border-[#2A2A2A] space-y-4">
                        <div>
                          <label className="text-gray-400 text-sm mb-1 block">Zoom</label>
                          <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setIsCropping(false)}
                            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-[#2A2A2A] transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSaveCrop}
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                          >
                            Valider & Enregistrer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Titre Bio */}
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Titre du Parcours</label>
                  <input
                    type="text"
                    name="aboutTitle"
                    value={settings.aboutTitle}
                    onChange={handleChange}
                    placeholder="Ex: Mon Parcours"
                    className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Biographie / Parcours</label>
                  <div className="rounded-md overflow-hidden border border-[#2A2A2A]">
                    <ReactQuill
                      theme="snow"
                      value={settings.aboutBio}
                      onChange={(content) => {
                        const newSettings = { ...settings, aboutBio: content };
                        setSettings(newSettings);
                        localStorage.setItem('adminSettings', JSON.stringify(newSettings));
                      }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['link', 'clean']
                        ],
                      }}
                      className="h-64 mb-12 text-gray-300"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section CV */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="border-t border-[#2A2A2A] pt-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiFile className="text-blue-500" />
                Gestion du CV
              </h3>

              {currentCV ? (
                <div className="bg-[#252525] rounded-lg p-4 border border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiFile className="text-blue-500 w-8 h-8" />
                      <div>
                        <p className="text-white font-medium">{currentCV.originalName}</p>
                        <p className="text-gray-400 text-sm">
                          {currentCV.size ? (currentCV.size / 1024 / 1024).toFixed(2) : '0.00'} MB •
                          Uploadé le {currentCV.uploadDate ? new Date(currentCV.uploadDate).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewCV}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="Voir le CV"
                      >
                        <FiEye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeleteCV}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Supprimer le CV"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#252525] rounded-lg p-6 border border-[#2A2A2A] border-dashed text-center">
                  <FiFile className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">Aucun CV uploadé</p>
                </div>
              )}

              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleCVUpload}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCV}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiUpload className="w-4 h-4" />
                  {isUploadingCV ? 'Upload en cours...' : currentCV ? 'Remplacer le CV' : 'Uploader un CV'}
                </motion.button>
                <p className="text-xs text-gray-500 mt-2">
                  Formats acceptés : PDF, PNG, JPEG • Taille max : 10MB
                </p>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
