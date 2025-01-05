import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiMove, FiEye, FiEyeOff, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SkillCategory {
  _id: string;
  name: string;
  displayOrder: number;
  isVisible: boolean;
}

const DEFAULT_CATEGORIES = [
  'Développement Web',
  'Base de données & Backend',
  'Outils de Développement',
  'CMS & Frameworks',
  'Logiciels'
];

export default function SkillCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchCategories();
    }
  }, [status]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/skill-categories');
      if (response.ok) {
        const data = await response.json();
        const uniqueCategories = data.filter((category, index, self) =>
          index === self.findIndex((c) => c.name === category.name)
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryExists = categories.some(
        cat => cat.name.toLowerCase() === newCategoryName.toLowerCase()
      );

      if (categoryExists) {
        toast.error('Cette catégorie existe déjà');
        return;
      }

      const response = await fetch('/api/admin/skill-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName,
          displayOrder: categories.length,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setIsAddingCategory(false);
        toast.success('Catégorie ajoutée');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la catégorie');
    }
  };

  const toggleVisibility = async (categoryId: string, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/skill-categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible }),
      });

      if (response.ok) {
        setCategories(prevCategories =>
          prevCategories.map(cat =>
            cat._id === categoryId ? { ...cat, isVisible } : cat
          )
        );
        toast.success(isVisible ? 'Catégorie affichée' : 'Catégorie masquée');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const initializeDefaultCategories = async () => {
    try {
      const existingNames = categories.map(cat => cat.name.toLowerCase());
      const categoriesToAdd = DEFAULT_CATEGORIES.filter(
        name => !existingNames.includes(name.toLowerCase())
      );

      for (const categoryName of categoriesToAdd) {
        const response = await fetch('/api/admin/skill-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: categoryName,
            displayOrder: DEFAULT_CATEGORIES.indexOf(categoryName),
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to create category: ${categoryName}`);
        }
      }
      await fetchCategories();
      toast.success('Catégories par défaut initialisées');
    } catch (error) {
      toast.error('Erreur lors de l\'initialisation des catégories');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* En-tête avec les onglets */}
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiCode className="w-8 h-8" />
            Skills Management
          </h1>
          
          {/* Onglets */}
          <div className="flex gap-2">
            <Link
              href="/admin/skills"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                !router.pathname.includes('categories')
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]'
              }`}
            >
              Skills
            </Link>
            <Link
              href="/admin/skill-categories"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                router.pathname.includes('categories')
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]'
              }`}
            >
              Categories
            </Link>
          </div>
        </div>

        {/* Bouton d'ajout */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <FiPlus className="w-5 h-5" /> Add Category
          </button>
        </div>

        {/* Liste des catégories style page d'accueil */}
        <div className="space-y-8">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                  <div className="h-0.5 w-full bg-gray-700"></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleVisibility(category._id, !category.isVisible)}
                    className={`p-2 rounded-lg ${
                      category.isVisible 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {category.isVisible ? <FiEye /> : <FiEyeOff />}
                  </button>
                  <button
                    onClick={() => {/* Logique de suppression */}}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal d'ajout de catégorie */}
        {isAddingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Ajouter une catégorie</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nom de la catégorie"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bouton d'initialisation si pas de catégories */}
        {categories.length === 0 && (
          <div className="text-center mt-8">
            <button
              onClick={initializeDefaultCategories}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 mx-auto"
            >
              <FiPlus className="w-5 h-5" /> Initialiser les catégories par défaut
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 