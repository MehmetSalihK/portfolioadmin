import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiUsers, FiCode, FiBriefcase, FiMail } from 'react-icons/fi';

interface DashboardStats {
  totalProjects: number;
  totalSkills: number;
  totalExperiences: number;
  totalMessages: number;
}

interface RecentActivity {
  _id: string;
  type: string;
  description: string;
  date: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSkills: 0,
    totalExperiences: 0,
    totalMessages: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, onClick }: { title: string; value: number; icon: any; onClick: () => void }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#1E2533] p-6 rounded-lg shadow-xl cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-400 text-sm uppercase font-medium mb-2">{title}</h3>
          <p className="text-white text-2xl font-semibold">{value}</p>
        </div>
        <div className="bg-blue-500/10 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#1A1F2C] p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back to your portfolio admin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FiCode}
            onClick={() => router.push('/admin/projects')}
          />
          <StatCard
            title="Total Skills"
            value={stats.totalSkills}
            icon={FiUsers}
            onClick={() => router.push('/admin/skills')}
          />
          <StatCard
            title="Experiences"
            value={stats.totalExperiences}
            icon={FiBriefcase}
            onClick={() => router.push('/admin/experience')}
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages}
            icon={FiMail}
            onClick={() => router.push('/admin/messages')}
          />
        </div>

        <div className="bg-[#1E2533] rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2A3241]">
            <h2 className="text-white font-medium">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#252D3C] text-gray-400 text-sm uppercase">
                  <th className="px-6 py-4 text-left font-medium">Type</th>
                  <th className="px-6 py-4 text-left font-medium">Description</th>
                  <th className="px-6 py-4 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      No recent activity found.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((activity) => (
                    <tr 
                      key={activity._id}
                      className="border-t border-[#2A3241] hover:bg-[#252D3C] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{activity.description}</td>
                      <td className="px-6 py-4 text-gray-400">{activity.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
};
