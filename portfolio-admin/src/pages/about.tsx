import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { FaUser, FaCode, FaPaintBrush, FaTools, FaVideo, FaMobileAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import parse from 'html-react-parser';

// Interface pour les settings
interface AboutSettings {
  aboutTitle?: string;
  aboutBio?: string;
  aboutImage?: string;
}

export default function About() {
  const [settings, setSettings] = useState<AboutSettings>({
    aboutTitle: 'Mon Parcours',
    aboutBio: '',
    aboutImage: ''
  });

  useEffect(() => {
    // Récupérer les données dynamiques
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Erreur chargement settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const features = [
    {
      icon: <FaCode className="w-6 h-6" />,
      title: "Développement Web",
      desc: "Expertise complète sur la stack MERN & Next.js. De la conception de l'interface (Frontend) à l'architecture API (Backend) et la gestion de bases de données."
    },
    {
      icon: <FaVideo className="w-6 h-6" />, // ou FaPaintBrush
      title: "Vidéo & Design",
      desc: "Création de contenu multimédia impactant : Montage vidéo dynamique (Premiere Pro, After Effects) et conception graphique de flyers et publicités."
    },
    {
      icon: <FaTools className="w-6 h-6" />,
      title: "Hardware & Maintenance",
      desc: "Support technique polyvalent : Diagnostic approfondi, réparation de smartphones et maintenance/montage de matériel informatique."
    }
  ];

  return (
    <Layout>
      <Head>
        <title>À Propos - Portfolio</title>
        <meta name="description" content="En savoir plus sur mon parcours et mes compétences" />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">À Propos</h1>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Image / Visual Side */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                    {settings.aboutImage ? (
                      <Image
                        src={settings.aboutImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                    ) : (
                      <div className="text-9xl text-gray-200 dark:text-gray-700">
                        <FaUser />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Content Side */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {settings.aboutTitle || 'Mon Parcours'}
                </h2>
                <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-none prose dark:prose-invert">
                  {settings.aboutBio ? (
                    parse(DOMPurify.sanitize(settings.aboutBio))
                  ) : (
                    <>
                      <p>
                        Bonjour ! Je suis un développeur Full Stack basé en France.
                        Mon voyage dans le monde du développement web a commencé par une simple curiosité pour le fonctionnement des sites internet...
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};
