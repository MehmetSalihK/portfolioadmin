import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import EnhancedProjectCard from '@/components/projects/EnhancedProjectCard';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import useAnalytics from '@/utils/hooks/useAnalytics';
import { FiSearch, FiX } from 'react-icons/fi';

interface ProjectsPageProps {
  projects: any[];
}

export default function Projects({ projects }: ProjectsPageProps) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useAnalytics({
    enabled: true,
    updateInterval: 30000,
    trackTimeSpent: true
  });

  const formattedProjects = projects.map(project => ({
    ...project,
    image: project.imageUrl
  }));

  const categories = ['All', ...Array.from(new Set(formattedProjects.map(p => p.category || 'Other')))];

  const filteredProjects = useMemo(() => {
    return formattedProjects.filter(project => {
      const matchesCategory = filter === 'All' || (project.category || 'Other') === filter;
      const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) || 
                          project.description.toLowerCase().includes(search.toLowerCase()) ||
                          project.technologies.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [formattedProjects, filter, search]);

  return (
    <Layout>
      <Head>
        <title>Mes Projets - Portfolio</title>
        <meta name="description" content="Une sélection de mes travaux récents" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">Mes Projets</h1>

          <div className="container-fluid relative z-10">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-12">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setFilter(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        filter === category 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un projet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX />
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Projects Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <EnhancedProjectCard key={project._id} project={project} />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <p className="text-xl text-gray-500 dark:text-gray-400">Aucun projet ne correspond à votre recherche.</p>
                <button 
                  onClick={() => { setFilter('All'); setSearch(''); }}
                  className="mt-4 text-blue-600 hover:underline font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    await connectDB();
    const projects = await Project.find({ 
      archived: { $ne: true }
    }).sort({ order: 1, createdAt: -1 }).lean();

    return {
      props: {
        projects: JSON.parse(JSON.stringify(projects)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      props: {
        projects: [],
      },
      revalidate: 60,
    };
  }
};
