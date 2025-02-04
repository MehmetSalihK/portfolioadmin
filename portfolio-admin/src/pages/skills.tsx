import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layout/Layout';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';
import { getSkillIcon } from '@/utils/skillIcons';

interface SkillsPageProps {
  skills: {
    _id: string;
    name: string;
    isVisible: boolean;
  }[];
}

export default function SkillsPage({ skills = [] }: SkillsPageProps) {
  const visibleSkills = skills.filter(skill => skill.isVisible);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-12">Mes Compétences</h1>
        
        {visibleSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSkills.map((skill) => {
              const SkillIcon = getSkillIcon(skill.name);
              return (
                <div
                  key={skill._id}
                  className="bg-[#1E1E1E] rounded-lg p-4 flex items-center gap-3"
                >
                  <SkillIcon className="w-6 h-6 text-gray-400" />
                  <span className="text-white">{skill.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            Aucune compétence trouvée
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    await connectDB();
    const skills = await Skill.find().lean();

    return {
      props: {
        skills: JSON.parse(JSON.stringify(skills)),
        ...(await serverSideTranslations(locale || 'fr', ['common'])),
      },
      revalidate: 1,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        skills: [],
        ...(await serverSideTranslations(locale || 'fr', ['common'])),
      },
      revalidate: 1,
    };
  }
};
