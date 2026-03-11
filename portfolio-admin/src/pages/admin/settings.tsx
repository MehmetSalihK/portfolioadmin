
import { useState, useEffect, useRef } from 'react';
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

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Seuls les fichiers PDF, PNG et JPEG sont autorisés');
      return;
    }

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
        toast.success('CV uploadé avec succès !');
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error("Erreur lors de l'upload du CV");
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
        toast.success('CV supprimé avec succès !');
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

  // Track input focus to control dropdown visibility
  const [isPositionFocused, setIsPositionFocused] = useState(false);

  // Debounced city autocomplete — supports both city names and postal codes
  useEffect(() => {
    const query = settings.position.trim();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Only search if focused and query has at least 2 chars
    if (!isPositionFocused || !query || query.length < 2) {
      setPositionSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        // type=municipality returns only cities (works for both city names and postal codes)
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=8&autocomplete=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const seen = new Set<string>();
          const suggestions: string[] = [];

          for (const feature of data.features) {
            const props = feature.properties;
            // For municipality type: name = city name, postcode = 5-digit code
            const cityName: string = props.name || props.city || '';
            // postcode can be a string or sometimes missing for large cities
            const postcode: string = typeof props.postcode === 'string' && /^\d{5}$/.test(props.postcode)
              ? props.postcode
              : '';

            if (!cityName) continue;

            const label = postcode ? `${cityName}, ${postcode}` : cityName;
            if (!seen.has(label)) {
              seen.add(label);
              suggestions.push(label);
            }
          }

          setPositionSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        } else {
          setPositionSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Erreur recherche ville:', error);
        setPositionSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  }, [settings.position, isPositionFocused]);


  const selectSuggestion = (suggestion: string) => {
    const newSettings = { ...settings, position: suggestion };
    setSettings(newSettings);
    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
    setIsPositionFocused(false);
    setShowSuggestions(false);
    setPositionSuggestions([]);
    positionInputRef.current?.blur();
  };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        toast.success('Paramètres sauvegardés !');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropping(true);
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
      toast.error('Erreur lors du recadrage');
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const uploadCroppedImage = async (blob: Blob) => {
    const toastId = toast.loading("Traitement de l'image...");
    try {
      const base64Image = await blobToBase64(blob);
      const newSettings = { ...settings, aboutImage: base64Image };
      setSettings(newSettings);
      localStorage.setItem('adminSettings', JSON.stringify(newSettings));
      toast.success("Image prête ! N'oubliez pas de sauvegarder.", { id: toastId });
    } catch (error) {
      console.error('Erreur conversion image:', error);
      toast.error("Erreur lors du traitement de l'image", { id: toastId });
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(event);
  };

  // ─── Styled helpers ──────────────────────────────────────────────────────────
  const inputCls = 'w-full bg-white/5 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none font-medium placeholder:text-zinc-600';
  const labelCls = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2';

  const fieldGroups: {
    section: string;
    category: string;
    fields: { label: string; name: keyof Settings; type: string; icon: React.ReactNode; placeholder?: string }[];
  }[] = [
    {
      section: 'Informations Générales',
      category: 'Site',
      fields: [
        { label: 'Titre du site', name: 'siteTitle', type: 'text', icon: <FiEdit3 className="w-4 h-4" />, placeholder: 'Mon Portfolio' },
        { label: 'Email de contact', name: 'email', type: 'email', icon: <FiMail className="w-4 h-4" />, placeholder: 'hello@example.com' },
        { label: 'Téléphone', name: 'phone', type: 'tel', icon: <FiPhone className="w-4 h-4" />, placeholder: '+33 6 00 00 00 00' },
      ]
    },
    {
      section: 'Réseaux Sociaux',
      category: 'Social',
      fields: [
        { label: 'GitHub', name: 'github', type: 'url', icon: <FiGithub className="w-4 h-4" />, placeholder: 'https://github.com/username' },
        { label: 'LinkedIn', name: 'linkedin', type: 'url', icon: <FiLinkedin className="w-4 h-4" />, placeholder: 'https://linkedin.com/in/username' },
        { label: 'Twitter / X', name: 'twitter', type: 'url', icon: <FiTwitter className="w-4 h-4" />, placeholder: 'https://twitter.com/username' },
        { label: 'WhatsApp', name: 'whatsapp', type: 'url', icon: <FaWhatsapp className="w-4 h-4" />, placeholder: 'https://wa.me/33600000000' },
        { label: 'Telegram', name: 'telegram', type: 'url', icon: <FaTelegram className="w-4 h-4" />, placeholder: 'https://t.me/username' },
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
              <span className="w-8 h-[1px] bg-indigo-500" />
              Configuration
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Settings</h1>
            <p className="text-zinc-500 mt-2 font-medium">Gérez les informations globales de votre portfolio.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all border border-indigo-500"
          >
            <FiSave className="w-4 h-4" />
            {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
          </motion.button>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General + Social fields */}
          {fieldGroups.map((group, gi) => (
            <motion.div
              key={group.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <FiSettings className="w-3.5 h-3.5" />
                  {group.category}
                </div>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>
              <p className="text-lg font-black text-white tracking-tight mb-6">{group.section}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {group.fields.map(field => (
                  <div key={field.name}>
                    <label className={labelCls}>{field.label}</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                        {field.icon}
                      </span>
                      <input
                        type={field.type}
                        name={field.name}
                        value={settings[field.name] as string}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className={`${inputCls} pl-11`}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Location with autocomplete */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 p-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <FiMapPin className="w-3.5 h-3.5" />
                Localisation
              </div>
              <div className="flex-1 h-[1px] bg-white/5" />
              {settings.position && !showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                >
                  <span className="text-sm leading-none">🇫🇷</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate max-w-[140px]">{settings.position}</span>
                </motion.div>
              )}
            </div>
            <p className="text-lg font-black text-white tracking-tight mb-1">Position Géographique</p>
            <p className="text-zinc-600 text-xs font-medium mb-6">Affiché dans la section Contact de votre portfolio public.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* City search */}
              <div className="relative z-50">
                <label className={labelCls}>
                  <span className="flex items-center gap-2">
                    Ville / Code postal
                    {isLoadingSuggestions && (
                      <span className="inline-block w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </span>
                </label>
                <div className="relative group">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors w-4 h-4" />
                  <input
                    ref={positionInputRef}
                    type="text"
                    name="position"
                    value={settings.position}
                    onChange={handleChange}
                    onFocus={() => setIsPositionFocused(true)}
                    onBlur={() => {
                      // Small delay so click on suggestion registers first
                      setTimeout(() => {
                        setIsPositionFocused(false);
                        setShowSuggestions(false);
                      }, 200);
                    }}
                    placeholder="Rechercher une ville ou code postal…"
                    className={`${inputCls} pl-11 pr-10`}
                    autoComplete="off"
                  />
                  {settings.position && (
                    <button
                      type="button"
                      onClick={() => {
                        const ns = { ...settings, position: '' };
                        setSettings(ns);
                        localStorage.setItem('adminSettings', JSON.stringify(ns));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      <span className="text-xs font-bold leading-none">✕</span>
                    </button>
                  )}
                </div>

                {/* Animated dropdown */}
                {showSuggestions && positionSuggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-[100] w-full mt-2 bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Suggestions</span>
                      <span className="text-[10px] text-zinc-700 font-bold">{positionSuggestions.length} résultat{positionSuggestions.length > 1 ? 's' : ''}</span>
                    </div>
                    {positionSuggestions.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => selectSuggestion(s)}
                        className="px-4 py-3 flex items-center gap-3 text-zinc-300 hover:bg-indigo-500/10 hover:text-white cursor-pointer border-b border-white/5 last:border-b-0 transition-all group/item"
                      >
                        <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-black text-zinc-600 group-hover/item:bg-indigo-500/20 group-hover/item:text-indigo-400 transition-colors flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-base leading-none">🇫🇷</span>
                        <span className="text-sm font-medium flex-1">{s}</span>
                        <FiMapPin className="w-3 h-3 text-zinc-700 group-hover/item:text-indigo-400 transition-colors flex-shrink-0" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Status hint */}
                <div className="mt-3">
                  {settings.position && !showSuggestions ? (
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
                      <span>✓</span> Ville enregistrée
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-700 font-medium">
                      Données : <span className="text-zinc-500 font-bold">Base Adresse Nationale (BAN)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Country info panel */}
              <div className="flex flex-col gap-3">
                <label className={labelCls}>Pays</label>
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-3xl">🇫🇷</span>
                  <div>
                    <p className="text-white font-black tracking-tight text-sm">France</p>
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">Métropole · DOM-TOM</p>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-700 leading-relaxed font-medium">
                  Recherche limitée aux communes françaises. Tapez au moins 2 caractères pour voir les suggestions.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Site Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <FiFileText className="w-3.5 h-3.5" />
                SEO
              </div>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            <p className="text-lg font-black text-white tracking-tight mb-6">Description du Site</p>
            <div>
              <label className={labelCls}>Meta Description</label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Description concise qui apparaît dans les résultats Google…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <FaUser className="w-3.5 h-3.5" />
                Profil
              </div>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            <p className="text-lg font-black text-white tracking-tight mb-6">Page À Propos</p>

            <div className="space-y-6">
              {/* Profile photo */}
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 flex-shrink-0">
                  {settings.aboutImage ? (
                    <Image src={settings.aboutImage} alt="Profile" fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                      <FaUser size={28} />
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Photo de Profil</label>
                  <label className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <FiUpload className="w-4 h-4" />
                    Choisir une photo
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </label>
                  <p className="text-[10px] text-zinc-600 mt-2 font-medium">Carré recommandé · JPG, PNG, WebP</p>
                </div>
              </div>

              {/* Crop Modal */}
              {isCropping && imageSrc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                  <div className="bg-[#0d0d12] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-white font-black tracking-tight">Recadrer la photo</h3>
                      <button onClick={() => setIsCropping(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all">
                        <span className="text-lg leading-none">✕</span>
                      </button>
                    </div>
                    <div className="relative h-80 w-full bg-black">
                      <Cropper
                        image={imageSrc} crop={crop} zoom={zoom} aspect={1}
                        onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom}
                      />
                    </div>
                    <div className="p-6 space-y-4 bg-zinc-900/50">
                      <div>
                        <label className={labelCls}>Zoom</label>
                        <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCropping(false)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                          Annuler
                        </button>
                        <button onClick={handleSaveCrop} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                          Valider le recadrage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* About Title */}
              <div>
                <label className={labelCls}>Titre de la section Parcours</label>
                <input type="text" name="aboutTitle" value={settings.aboutTitle} onChange={handleChange}
                  placeholder="Ex: Mon Parcours" className={inputCls} />
              </div>

              {/* Bio Editor */}
              <div>
                <label className={labelCls}>Biographie / Parcours</label>
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <ReactQuill
                    theme="snow" value={settings.aboutBio}
                    onChange={(content) => {
                      const newSettings = { ...settings, aboutBio: content };
                      setSettings(newSettings);
                      localStorage.setItem('adminSettings', JSON.stringify(newSettings));
                    }}
                    modules={{ toolbar: [[{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ 'list': 'ordered' }, { 'list': 'bullet' }], ['link', 'clean']] }}
                    className="h-64 mb-12 text-zinc-300"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* CV Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <FiFile className="w-3.5 h-3.5" />
                Documents
              </div>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            <p className="text-lg font-black text-white tracking-tight mb-6">Gestion du CV</p>

            {currentCV ? (
              <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <FiFile className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-black tracking-tight">{currentCV.originalName}</p>
                    <p className="text-zinc-600 text-xs font-bold tabular-nums mt-0.5">
                      {currentCV.size ? (currentCV.size / 1024 / 1024).toFixed(2) : '0.00'} MB
                      {currentCV.uploadDate && ` · ${new Date(currentCV.uploadDate).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleViewCV} className="p-2.5 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all" title="Voir le CV">
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button onClick={handleDeleteCV} className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all" title="Supprimer">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed border-white/10 text-center">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                  <FiFile className="w-7 h-7 text-zinc-600" />
                </div>
                <p className="text-zinc-500 font-medium">Aucun CV uploadé</p>
              </div>
            )}

            <div className="mt-4">
              <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleCVUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCV}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiUpload className="w-4 h-4" />
                {isUploadingCV ? 'Upload…' : currentCV ? 'Remplacer le CV' : 'Uploader un CV'}
              </button>
              <p className="text-[10px] text-zinc-600 mt-2 font-medium">PDF, PNG, JPEG · Taille max 10 MB</p>
            </div>
          </motion.div>
        </form>
      </div>
    </AdminLayout>
  );
}
