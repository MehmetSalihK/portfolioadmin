import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'next-themes';
import Layout from '@/components/layout/Layout';
import { getSkillIcon } from '@/utils/skillIcons';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';

interface Skill {
  _id: string;
  name: string;
  category: string;
}

export default function Skills() {
  const { t } = useTranslation('skills');
  const { theme } = useTheme();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skills');
        const data = await response.json();
        setSkills(data);
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-400">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t('title')} - Portfolio</title>
        <meta name="description" content={t('description')} />
      </Head>

      <main className="min-h-screen bg-gray-50 dark:bg-[#0B1121] text-gray-900 dark:text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">{t('title')}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => {
              const SkillIcon = getSkillIcon(skill.name);
              return (
                <div
                  key={skill._id}
                  className="bg-white dark:bg-[#1E1E1E] rounded-lg p-6 
                           shadow-lg hover:shadow-xl dark:shadow-none
                           hover:bg-gray-50 dark:hover:bg-gray-800/50 
                           transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-gray-600 dark:text-gray-400">
                      <SkillIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium">{skill.name}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
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
