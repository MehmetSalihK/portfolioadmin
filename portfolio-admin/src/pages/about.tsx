import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { FaUser, FaCode, FaServer, FaDatabase } from 'react-icons/fa';

export default function About() {
  const features = [
    {
      icon: <FaCode className="w-6 h-6" />,
      title: "Frontend Development",
      desc: "Création d'interfaces utilisateur modernes et réactives avec React, Next.js et Tailwind CSS."
    },
    {
      icon: <FaServer className="w-6 h-6" />,
      title: "Backend Development",
      desc: "Architecture API robuste et scalable avec Node.js, Express et NestJS."
    },
    {
      icon: <FaDatabase className="w-6 h-6" />,
      title: "Database Design",
      desc: "Modélisation et optimisation de bases de données SQL (PostgreSQL) et NoSQL (MongoDB)."
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
                      <div className="text-9xl text-gray-200 dark:text-gray-700">
                        <FaUser />
                      </div>
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
                  Mon Parcours
                </h2>
                <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Bonjour ! Je suis un développeur Full Stack basé en France.
                    Mon voyage dans le monde du développement web a commencé par une simple curiosité pour le fonctionnement des sites internet, 
                    qui s'est rapidement transformée en une véritable passion pour la création d'expériences numériques.
                  </p>
                  <p>
                    Aujourd'hui, je me spécialise dans la stack MERN (MongoDB, Express, React, Node.js) et Next.js, 
                    créant des applications web qui ne sont pas seulement fonctionnelles, mais aussi rapides, accessibles et visuellement attrayantes.
                  </p>
                  <p>
                    Quand je ne code pas, vous pouvez me trouver en train d'explorer les nouvelles technologies, 
                    de contribuer à des projets open-source ou simplement de profiter d'un bon café en lisant un livre technique.
                  </p>
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
