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
      <div className="space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FiAward className="w-5 h-5 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Compétences</h1>
          </div>
          <p className="text-zinc-500 font-medium">Gérez les compétences techniques et soft skills affichées sur votre portfolio ({initialSkills.length}).</p>
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
