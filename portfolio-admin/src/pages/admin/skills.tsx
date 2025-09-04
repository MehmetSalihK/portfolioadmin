import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminLayout from '@/components/layouts/AdminLayout';
import SkillsManagement from '@/components/admin/skills/SkillsManagement';
import connectDB from '@/lib/db';
import Skill from '@/models/Skill';
import { FiAward } from 'react-icons/fi';

interface AdminSkillsPageProps {
  initialSkills: {
  _id: string;
  name: string;
    isVisible: boolean;
  }[];
}

export default function AdminSkillsPage({ initialSkills }: AdminSkillsPageProps) {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiAward className="w-8 h-8" />
              Gestion des compétences
          </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gérez les compétences affichées sur votre portfolio ({initialSkills.length})
            </p>
          </div>
        </div>
        <SkillsManagement initialSkills={initialSkills} />
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  try {
    await connectDB();
    const skills = await Skill.find().lean();

    return {
      props: {
        initialSkills: JSON.parse(JSON.stringify(skills)),
      },
    };
  } catch (error) {
    console.error('Error fetching skills:', error);
    return {
      props: {
        initialSkills: [],
      },
    };
  }
};
