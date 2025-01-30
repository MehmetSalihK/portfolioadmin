import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProjectCard from '@/components/projects/ProjectCard';
import NextIntlProvider from '@/components/providers/NextIntlProvider';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

interface ProjectsPageProps {
  projects: Array<{
    _id: string;
    title: string;
    description: string;
    image: string;
    technologies: string[];
    demoUrl?: string;
    githubUrl?: string;
  }>;
  messages: any;
  locale: string;
}

function ProjectsContent({ projects = [] }: { projects: ProjectsPageProps['projects'] }) {
  const t = useTranslations('Projects');

  return (
    <Layout>
      <Head>
        <title>{t('pageTitle')}</title>
        <meta name="description" content={t('pageDescription')} />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">{t('title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-center text-gray-500">{t('noProjects')}</p>
        )}
      </main>
    </Layout>
  );
}

export default function Projects({ projects, messages, locale }: ProjectsPageProps) {
  return (
    <NextIntlProvider messages={messages} locale={locale}>
      <ProjectsContent projects={projects} />
    </NextIntlProvider>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  try {
    await connectDB();
    const projects = await Project.find({}).lean();

    return {
      props: {
        projects: JSON.parse(JSON.stringify(projects)),
        messages: (await import(`../../messages/${locale}.json`)).default,
        locale,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      props: {
        projects: [],
        messages: (await import(`../../messages/${locale}.json`)).default,
        locale,
      },
      revalidate: 60,
    };
  }
};
