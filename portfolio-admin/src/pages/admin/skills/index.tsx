import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Skill {
  _id: string;
  name: string;
}

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleDelete = async () => {
    if (!skillToDelete) return;

    try {
      const response = await fetch(`/api/skills/${skillToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSkills((prev) =>
          prev.filter((skill) => skill._id !== skillToDelete._id)
        );
        setDeleteModalOpen(false);
        setSkillToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Skills</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/skills/new')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FiPlus className="mr-2" /> Add Skill
          </motion.button>
        </div>

        <div className="bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#252525]">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {skills.map((skill) => (
                  <motion.tr
                    key={skill._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-[#252525] cursor-pointer"
                    onClick={() => router.push(`/admin/skills/${skill._id}`)}
                  >
                    <td className="px-6 py-4 text-sm text-white">
                      {skill.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/skills/${skill._id}/edit`);
                        }}
                        className="text-blue-500 hover:text-blue-600 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSkillToDelete(skill);
                          setDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">
              Are you sure you want to delete "{skillToDelete?.name}"?
            </h2>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-600 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
