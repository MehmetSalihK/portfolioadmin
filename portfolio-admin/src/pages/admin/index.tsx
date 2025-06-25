import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiMail, FiBriefcase, FiCode, FiFolder } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface DashboardStats {
  unreadMessages: number;
  projects: number;
  skills: number;
  experiences: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    unreadMessages: 0,
    projects: 0,
    skills: 0,
    experiences: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [messagesResponse, projectsResponse, skillsResponse, experiencesResponse] = await Promise.all([
        fetch('/api/admin/messages?filter=unread'),
        fetch('/api/projects'),
        fetch('/api/skills'),
        fetch('/api/experiences')
      ]);

      const messages = await messagesResponse.json();
      const projects = await projectsResponse.json();
      const skills = await skillsResponse.json();
      const experiences = await experiencesResponse.json();

      setStats({
        unreadMessages: messages?.messages?.length || 0,
        projects: projects?.length || 0,
        skills: skills?.length || 0,
        experiences: experiences?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Messages non lus',
      value: loading ? '...' : stats.unreadMessages,
      icon: FiMail,
      description: 'Nouveaux messages des visiteurs',
      color: 'from-blue-400 to-blue-600',
      link: '/admin/messages'
    },
    {
      title: 'Total Projets',
      value: loading ? '...' : stats.projects,
      icon: FiFolder,
      description: 'Projets dans votre portfolio',
      color: 'from-purple-400 to-purple-600',
      link: '/admin/projects'
    },
    {
      title: 'Total Compétences',
      value: loading ? '...' : stats.skills,
      icon: FiCode,
      description: 'Compétences et technologies',
      color: 'from-green-400 to-green-600',
      link: '/admin/skills'
    },
    {
      title: 'Total Expériences',
      value: loading ? '...' : stats.experiences,
      icon: FiBriefcase,
      description: 'Expériences professionnelles et formations',
      color: 'from-orange-400 to-orange-600',
      link: '/admin/experience'
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(card.link)}
                >
                  <div className="relative overflow-hidden bg-[#1E1E1E] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-400">{card.title}</p>
                          <h3 className="text-3xl font-bold text-white mt-1">
                            {card.value}
                          </h3>
                        </div>
                        <div className={`p-3 rounded-full bg-gradient-to-br ${card.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{card.description}</p>
                      
                      {/* Progress bar */}
                      <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                          className={`h-full bg-gradient-to-r ${card.color}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Activité récente</h2>
            <div className="bg-[#1E1E1E] rounded-lg p-6">
              <div className="space-y-4">
                {/* Activity items would go here */}
                <p className="text-gray-400">Aucune activité récente à afficher</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
