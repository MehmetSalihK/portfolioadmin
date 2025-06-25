import { useState, useEffect } from 'react';
import { FiSend, FiMail, FiLinkedin, FiGithub, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';

interface ContactPageProps {
  settings: {
    email: string;
    github: string;
    linkedin: string;
    position: string;
  }
}

interface LocationData {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function ContactPage({ settings = { email: '', github: '', linkedin: '', position: '' } }: ContactPageProps) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', company: '', phone: '',
    email: '', subject: '', message: ''
  });
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const geocodePosition = async (position: string) => {
    if (!position) return;
    try {
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(position)}&limit=1`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        const cityName = feature.properties.city || feature.properties.label;
        setLocationData({
          name: cityName,
          coordinates: { lat, lng }
        });
        const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}&zoom=13`;
        const fallbackUrl = `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d35034.27598397238!2d${lng}!3d${lat}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2s${encodeURIComponent(cityName)}!5e0!3m2!1sfr!2sfr!4v1738647148138!5m2!1sfr!2sfr`;
        setMapUrl(fallbackUrl);
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
    }
  };

  useEffect(() => {
    if (settings.position) {
      geocodePosition(settings.position);
    } else {
      setLocationData({ name: 'Nogent-sur-Oise, France', coordinates: { lat: 49.2586, lng: 2.4826 } });
      setMapUrl('https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d35034.27598397238!2d2.4825724346456397!3d49.2586183631009!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e64a38b9d28da5%3A0x1c0af141f1252070!2s60180%20Nogent-sur-Oise!5e0!3m2!1sfr!2sfr!4v1738647148138!5m2!1sfr!2sfr');
    }
  }, [settings.position]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Message envoyé avec succès !');
        setFormData({ firstName: '', lastName: '', company: '', phone: '', 
                     email: '', subject: '', message: '' });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Contact - Portfolio</title>
        <meta name="description" content="Contactez-moi pour vos projets" />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">Contact</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Colonne de gauche - Formulaire */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Envoyez-moi un message</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Prénom et Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
                      <input type="text" value={formData.firstName} placeholder="John"
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                        required />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                      <input type="text" value={formData.lastName} placeholder="Doe"
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                        required />
                    </div>
                  </div>

                  {/* Société et Téléphone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Société <span className="text-gray-500 dark:text-gray-400 text-xs">(optionnel)</span>
                      </label>
                      <input type="text" value={formData.company} placeholder="Entreprise SA"
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Téléphone <span className="text-gray-500 dark:text-gray-400 text-xs">(optionnel)</span>
                      </label>
                      <input type="tel" value={formData.phone} placeholder="Téléphone"
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <input type="email" value={formData.email} placeholder="email@exemple.com"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                      required />
                  </div>

                  {/* Sujet */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Sujet *</label>
                    <input type="text" value={formData.subject} placeholder="Sujet de votre message"
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                      required />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                    <textarea value={formData.message} placeholder="Votre message..."
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 resize-none"
                      required />
                  </div>

                  {/* Bouton d'envoi */}
                  <div className="text-right pt-2">
                    <button type="submit"
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg inline-flex items-center gap-2 text-sm">
                      <FiSend className="w-4 h-4" />
                      Envoyer
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Colonne de droite - Informations de contact */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Restons en contact</h2>
              <div className="space-y-4">
                {/* Card des liens de contact */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    N'hésitez pas à me contacter pour discuter de vos projets ou pour toute autre question. 
                    Je vous répondrai dans les plus brefs délais.
                  </p>

                  <div className="space-y-4">
                    {settings?.email && (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded">
                          <FiMail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">Email</div>
                          <a href={`mailto:${settings.email}`} className="text-blue-400 hover:text-blue-300">
                            {settings.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {settings?.linkedin && (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded">
                          <FiLinkedin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">LinkedIn</div>
                          <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:text-blue-300">
                            {settings.linkedin.replace('https://www.linkedin.com/in/', '')}
                          </a>
                        </div>
                      </div>
                    )}

                    {settings?.github && (
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded">
                          <FiGithub className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">GitHub</div>
                          <a href={settings.github} target="_blank" rel="noopener noreferrer"
                             className="text-blue-400 hover:text-blue-300">
                            {settings.github.replace('https://github.com/', '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Maps */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg">
                  {mapUrl && (
                    <iframe
                      src={mapUrl}
                      width="100%"
                      height="262"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg shadow-lg transition-all duration-500 filter grayscale hover:grayscale-0"
                    />
                  )}
                  <div className="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-400 px-2 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{settings?.position || locationData?.name || 'Localisation'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    await connectDB();
    const settings = await Setting.findOne().lean() as any;
    
    return {
      props: {
        settings: {
          email: settings?.email || 'contact@mehmetsalihk.fr',
          github: settings?.github || 'https://github.com/mehmetsalihk',
          linkedin: settings?.linkedin || 'https://www.linkedin.com/in/mehmetsalihk/',
          position: settings?.position || '60180 Nogent-sur-Oise'
        }
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return {
      props: {
        settings: {
          email: 'contact@mehmetsalihk.fr',
          github: 'https://github.com/mehmetsalihk',
          linkedin: 'https://www.linkedin.com/in/mehmetsalihk/',
          position: '60180 Nogent-sur-Oise'
        }
      },
      revalidate: 60
    }
  };
};
