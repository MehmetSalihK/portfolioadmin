import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiMail, FiBriefcase, FiCode, FiFolder } from 'react-icons/fi';
import { useEffect, useState } from 'react';

interface DashboardStats {
  messages: number;
  projects: number;
  skills: number;
  experiences: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    messages: 0,
    projects: 0,
    skills: 0,
    experiences: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      // Fetch actual stats from your API endpoints
      const [messages, projects, skills, experiences] = await Promise.all([
        fetch('/api/messages').then(res => res.json()),
        fetch('/api/projects').then(res => res.json()),
        fetch('/api/skills').then(res => res.json()),
        fetch('/api/experiences').then(res => res.json())
      ]);

      setStats({
        messages: messages?.length || 0,
        projects: projects?.length || 0,
        skills: skills?.length || 0,
        experiences: experiences?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const cards = [
    {
      title: 'Unread Messages',
      value: stats.messages,
      icon: FiMail,
      description: 'New messages from visitors',
      color: 'from-blue-400 to-blue-600',
      link: '/admin/messages'
    },
    {
      title: 'Total Projects',
      value: stats.projects,
      icon: FiFolder,
      description: 'Projects in your portfolio',
      color: 'from-purple-400 to-purple-600',
      link: '/admin/projects'
    },
    {
      title: 'Total Skills',
      value: stats.skills,
      icon: FiCode,
      description: 'Skills and technologies',
      color: 'from-green-400 to-green-600',
      link: '/admin/skills'
    },
    {
      title: 'Total Experiences',
      value: stats.experiences,
      icon: FiBriefcase,
      description: 'Work and education experiences',
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
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-[#1E1E1E] rounded-lg p-6">
              <div className="space-y-4">
                {/* Activity items would go here */}
                <p className="text-gray-400">No recent activity to display</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
