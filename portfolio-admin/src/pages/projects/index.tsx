import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProjectCard from '@/components/projects/ProjectCard';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

interface ProjectsPageProps {
  projects: Array<{
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    demoUrl?: string;
    githubUrl?: string;
  }>;
}

export default function Projects({ projects }: ProjectsPageProps) {
  const formattedProjects = projects.map(project => ({
    ...project,
    image: project.imageUrl // Map imageUrl to image for ProjectCard
  }));

  return (
    <Layout>
      <Head>
        <title>Projets - Portfolio</title>
        <meta name="description" content="Découvrez mes projets et réalisations" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Mes Projets
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formattedProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
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
      showOnHomepage: true,
      archived: { $ne: true }
    }).sort({ order: 1 }).lean();

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
