import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

interface Experience {
  _id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export default function ExperiencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchExperiences();
    }
  }, [status]);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/experiences');
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Experience</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/experience/new')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FiPlus className="mr-2" /> Add Experience
          </motion.button>
        </div>

        <div className="bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#252525] text-gray-400 text-sm">
                <th className="px-6 py-4 text-left">TITLE</th>
                <th className="px-6 py-4 text-left">COMPANY</th>
                <th className="px-6 py-4 text-left">DURATION</th>
                <th className="px-6 py-4 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((experience) => (
                <tr 
                  key={experience._id}
                  className="border-t border-[#2A2A2A] hover:bg-[#252525] transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/experience/${experience._id}`)}
                >
                  <td className="px-6 py-4 text-white">{experience.title}</td>
                  <td className="px-6 py-4 text-gray-400">{experience.company}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate!)}
                  </td>
                  <td className="px-6 py-4">
                    {experience.current ? (
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 text-sm rounded">
                        Current
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-sm rounded">
                        Past
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {experiences.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No experiences found. Click the Add Experience button to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
