import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

export default function ProjectsPage({ projects = [] }: ProjectsPageProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      <Head>
        <title>Projets</title>
        <meta name="description" content="Liste des projets" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Projets</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-center text-gray-500">Aucun projet disponible</p>
        )}
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'fr' }) => {
  try {
    await connectDB();
    const projects = await Project.find({}).lean();

    return {
      props: {
        projects: JSON.parse(JSON.stringify(projects)),
        ...(await serverSideTranslations(locale, ['common'])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      props: {
        projects: [],
        ...(await serverSideTranslations(locale, ['common'])),
      },
      revalidate: 60,
    };
  }
};
