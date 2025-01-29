import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiBriefcase, FiX, FiCalendar, FiMapPin, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  companyUrl?: string;
}

export default function ExperiencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    technologies: '',
    companyUrl: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/admin/experiences');
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des expériences');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newExperience,
          technologies: newExperience.technologies.split(',').map(tech => tech.trim())
        }),
      });

      if (response.ok) {
        await fetchExperiences();
        setIsAddingExperience(false);
        setNewExperience({
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          technologies: '',
          companyUrl: ''
        });
        toast.success('Expérience ajoutée avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'expérience');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiBriefcase className="w-8 h-8" />
            Experience Management
          </h1>
          <button
            onClick={() => setIsAddingExperience(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <FiPlus className="w-5 h-5" /> Add Experience
          </button>
        </div>

        {/* Liste des expériences */}
        <div className="space-y-4">
          {experiences.map((experience) => (
            <motion.div
              key={experience._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1E1E1E] p-4 rounded-lg"
            >
              <h3 className="text-xl font-semibold text-white">{experience.title}</h3>
              <p className="text-gray-400">{experience.company}</p>
              {/* ... autres détails de l'expérience ... */}
            </motion.div>
          ))}
        </div>

        {/* Modal d'ajout d'expérience */}
        <AnimatePresence>
          {isAddingExperience && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Add New Experience</h2>
                  <button
                    onClick={() => setIsAddingExperience(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newExperience.location}
                        onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Company URL
                      </label>
                      <input
                        type="url"
                        value={newExperience.companyUrl}
                        onChange={(e) => setNewExperience({ ...newExperience, companyUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newExperience.startDate}
                        onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newExperience.endDate}
                        onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Technologies (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={newExperience.technologies}
                      onChange={(e) => setNewExperience({ ...newExperience, technologies: e.target.value })}
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="React, Node.js, TypeScript..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingExperience(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Add Experience
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
