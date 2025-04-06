import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import { motion } from 'framer-motion';
import { FiHome, FiLoader, FiSave } from 'react-icons/fi';

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
    snapchat: string;
    instagram: string;
    telegram: string;
    phone: string;
    email: string;
  };
}

const defaultData: HomePageData = {
  title: 'Bienvenue sur mon Portfolio',
  subtitle: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes',
  aboutTitle: 'À propos de moi',
  aboutText: 'Je suis un développeur Full Stack passionné par la création d\'applications web innovantes. Avec une solide expérience dans le développement front-end et back-end, je m\'efforce de créer des solutions élégantes et performantes qui répondent aux besoins des utilisateurs.',
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: '',
    whatsapp: '',
    snapchat: '',
    instagram: '',
    telegram: '',
    phone: '',
    email: ''
  }
};

export default function HomePageAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<HomePageData>(defaultData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/homepage');
      if (!response.ok) throw new Error('Erreur lors du chargement des données');
      const fetchedData = await response.json();
      setData({
        ...defaultData,
        ...fetchedData,
        socialLinks: {
          ...defaultData.socialLinks,
          ...(fetchedData.socialLinks || {})
        }
      });
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les données. Veuillez réessayer.');
      toast.error('Erreur lors du chargement des données');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      toast.success('Modifications enregistrées avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <FiHome className="text-2xl text-white" />
            <h1 className="text-2xl font-bold text-white">Page d'accueil</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Section Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1E1E1E] p-6 rounded-xl border border-[#2A2A2A] hover:border-blue-500/50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Section Hero</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre principal
                </label>
                <input
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sous-titre
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={data.subtitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Section À propos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1E1E1E] p-6 rounded-xl border border-[#2A2A2A] hover:border-blue-500/50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Section À propos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre "À propos"
                </label>
                <input
                  type="text"
                  name="aboutTitle"
                  value={data.aboutTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Texte "À propos"
                </label>
                <RichTextEditor
                  content={data.aboutText}
                  onChange={(content) => setData(prev => ({ ...prev, aboutText: content }))}
                />
              </div>
            </div>
          </motion.div>

          {/* Liens sociaux */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1E1E1E] p-6 rounded-xl border border-[#2A2A2A] hover:border-blue-500/50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Liens sociaux</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub
                </label>
                <input
                  type="text"
                  name="socialLinks.github"
                  value={data.socialLinks.github}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="socialLinks.linkedin"
                  value={data.socialLinks.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  name="socialLinks.twitter"
                  value={data.socialLinks.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="socialLinks.instagram"
                  value={data.socialLinks.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp
                </label>
                <input
                  type="text"
                  name="socialLinks.whatsapp"
                  value={data.socialLinks.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Snapchat
                </label>
                <input
                  type="text"
                  name="socialLinks.snapchat"
                  value={data.socialLinks.snapchat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  name="socialLinks.telegram"
                  value={data.socialLinks.telegram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="socialLinks.phone"
                  value={data.socialLinks.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="socialLinks.email"
                  value={data.socialLinks.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </AdminLayout>
  );
}
