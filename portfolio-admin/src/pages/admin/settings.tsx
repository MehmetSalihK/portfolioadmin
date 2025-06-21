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
  FiMapPin
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newSettings = {
      ...settings,
      [name]: value
    };
    setSettings(newSettings);
    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
    
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
          </form>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
