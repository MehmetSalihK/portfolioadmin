import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/layout/Layout';
import SkillCategory from '@/components/skills/SkillCategory';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';

interface SkillsPageProps {
  skills: Array<{
    _id: string;
    name: string;
    category: string;
    level: number;
    icon: string;
  }>;
}

export default function Skills({ skills }: SkillsPageProps) {
  const { t } = useTranslation('skills');

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <Layout>
      <Head>
        <title>{t('title')} - Portfolio</title>
        <meta name="description" content={t('description')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('title')}
          </h1>

          <div className="max-w-6xl mx-auto">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <SkillCategory
                key={category}
                category={category}
                skills={categorySkills}
              />
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
    const skills = await Skill.find({}).sort({ category: 1, order: 1 }).lean();

    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'fr', ['common', 'skills'])),
        skills: JSON.parse(JSON.stringify(skills)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching skills:', error);
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'fr', ['common', 'skills'])),
        skills: [],
      },
      revalidate: 60,
    };
  }
};
