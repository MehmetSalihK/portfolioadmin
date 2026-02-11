import { GetStaticProps } from 'next';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import EnhancedProjectCard from '@/components/projects/EnhancedProjectCard';
import connectDB from '@/lib/db';
import ProjectModel from '@/models/Project';
import useAnalytics from '@/utils/hooks/useAnalytics';

interface ProjectsPageProps {
  projects: any[];
}

export default function Projects({ projects }: ProjectsPageProps) {
  useAnalytics({
    enabled: true,
    updateInterval: 30000,
    trackTimeSpent: true
  });

  const formattedProjects = projects.map(project => ({
    ...project,
    image: project.imageUrl
  }));

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
            {/* Projects Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {formattedProjects.map((project) => (
                  <EnhancedProjectCard key={project._id} project={project} />
                ))}
              </AnimatePresence>
            </motion.div>

            {formattedProjects.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <p className="text-xl text-gray-500 dark:text-gray-400">Aucun projet disponible pour le moment.</p>
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
    const projects = await ProjectModel.find({ 
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
