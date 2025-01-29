import { useState, useEffect } from 'react';
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
  FiPhone
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

interface Settings {
  siteTitle: string;
  siteDescription: string;
  email: string;
  phone: string;
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
      github: '',
      linkedin: '',
      twitter: '',
      whatsapp: '',
      telegram: ''
    };
  });
  const [isSaving, setIsSaving] = useState(false);

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
  };

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
