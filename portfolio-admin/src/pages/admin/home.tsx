import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import LivePreview from '@/components/LivePreview';
import { usePreviewSync } from '@/hooks/usePreviewSync';
import { getPreviewUrl } from '@/utils/getBaseUrl';

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
    telegram: string;
  };
}

const defaultData: HomePageData = {
  title: 'Portfolio Professionnel',
  subtitle: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes. Spécialisé dans React, Next.js, Node.js et les technologies cloud.',
  aboutTitle: 'À propos',
  aboutText: 'Je suis un développeur Full Stack passionné par la création d\'applications web innovantes. Avec une solide expérience dans le développement front-end et back-end, je m\'efforce de créer des solutions élégantes et performantes qui répondent aux besoins des utilisateurs.',
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: '',
    whatsapp: '',
    telegram: ''
  }
};

export default function HomePageAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<HomePageData>(defaultData);
  const [showPreview, setShowPreview] = useState(false);
  const { notifyChange, isConnected } = usePreviewSync();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/homepage');
      if (!response.ok) throw new Error('Erreur lors du chargement des données');
      const fetchedData = await response.json();
      
      // Only keep properties that exist in our current data model
      const { title, subtitle, aboutTitle, aboutText, socialLinks } = fetchedData;
      
      setData({
        ...defaultData,
        ...(title !== undefined ? { title } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(aboutTitle !== undefined ? { aboutTitle } : {}),
        ...(aboutText !== undefined ? { aboutText } : {}),
        socialLinks: {
          ...defaultData.socialLinks,
          ...(socialLinks || {})
        }
      });
    } catch (error) {
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

      toast.success('Modifications enregistrées');
      notifyChange('homepage-update');
    } catch (error) {
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
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Modifier la page d'accueil</h1>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showPreview
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            👁️
            {isConnected && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            Prévisualisation
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Hero */}
          <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#2A2A2A]">
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
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section À propos */}
          <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#2A2A2A]">
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
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
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
          </div>

          {/* Liens sociaux */}
          <div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#2A2A2A]">
            <h2 className="text-xl font-semibold text-white mb-4">Liens sociaux</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub
                </label>
                <input
                  type="text"
                  name="socialLinks.github"
                  value={data.socialLinks.github}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>



          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Prévisualisation en temps réel */}
      <LivePreview
        isVisible={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
        previewUrl={getPreviewUrl()}
        autoRefresh={isConnected}
        refreshInterval={2000}
      />
    </AdminLayout>
  );
}
