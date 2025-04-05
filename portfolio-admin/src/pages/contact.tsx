import { useState } from 'react';
import { FiSend, FiMail, FiLinkedin, FiGithub } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { GetStaticProps } from 'next';

interface ContactPageProps {
  settings: {
    email: string;
    github: string;
    linkedin: string;
  }
}

export default function ContactPage({ settings = { email: '', github: '', linkedin: '' } }: ContactPageProps) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', company: '', phone: '',
    email: '', subject: '', message: ''
  });

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

      <main className="min-h-screen bg-[#0f172a]">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl font-bold text-white text-center mb-12">Contact</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Colonne de gauche - Formulaire */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Envoyez-moi un message</h2>
              <div className="bg-[#1e293b] rounded-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Prénom et Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Prénom *</label>
                      <input type="text" value={formData.firstName} placeholder="John"
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#2e3b4e] rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-blue-500"
                        required />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Nom *</label>
                      <input type="text" value={formData.lastName} placeholder="Doe"
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#2e3b4e] rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-blue-500"
                        required />
                    </div>
                  </div>

                  {/* Société et Téléphone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Société <span className="text-gray-500 text-xs">(optionnel)</span>
                      </label>
                      <input type="text" value={formData.company} placeholder="Entreprise SA"
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 bg-[#2e3b4e] rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Téléphone <span className="text-gray-500 text-xs">(optionnel)</span>
                      </label>
                      <input type="tel" value={formData.phone} placeholder="Téléphone"
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-[#2e3b4e] rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email *</label>
                    <input type="email" value={formData.email} placeholder="email@exemple.com"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2e3b4e] rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-blue-500"
                      required />
                  </div>

                  {/* Sujet */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Sujet *</label>
                    <input type="text" value={formData.subject} placeholder="Sujet de votre message"
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2e3b4e] rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-blue-500"
                      required />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Message *</label>
                    <textarea value={formData.message} placeholder="Votre message..."
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 bg-[#2e3b4e] rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-blue-500 resize-none"
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
              <h2 className="text-2xl font-bold text-white mb-4">Restons en contact</h2>
              <div className="space-y-4">
                {/* Card des liens de contact */}
                <div className="bg-[#1e293b] rounded-xl p-6">
                  <p className="text-gray-400 mb-6">
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
                          <div className="text-white font-medium">Email</div>
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
                          <div className="text-white font-medium">LinkedIn</div>
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
                          <div className="text-white font-medium">GitHub</div>
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
                <div className="bg-[#1e293b] rounded-xl p-2">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d35034.27598397238!2d2.4825724346456397!3d49.2586183631009!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e64a38b9d28da5%3A0x1c0af141f1252070!2s60180%20Nogent-sur-Oise!5e0!3m2!1sfr!2sfr!4v1738647148138!5m2!1sfr!2sfr"
                    width="100%"
                    height="262"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  />
                  <div className="mt-2 flex items-center gap-2 text-gray-400 px-2 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Nogent-sur-Oise, France</span>
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
  // Retourner directement les valeurs par défaut sans accéder à la base de données
  return {
    props: {
      settings: {
        email: 'contact@mehmetsalihk.fr',
        github: 'https://github.com/mehmetsalihk',
        linkedin: 'https://www.linkedin.com/in/mehmetsalihk/'
      }
    },
    revalidate: 60
  };
};
