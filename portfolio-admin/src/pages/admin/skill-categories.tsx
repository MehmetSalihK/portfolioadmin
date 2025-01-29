import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiMove, FiEye, FiEyeOff, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import * as Si from 'react-icons/si';
import { FaCode, FaReact, FaNodeJs, FaGit, FaDocker, FaAws, FaJava, FaPhp, FaNpm, FaWordpress, FaGitlab } from 'react-icons/fa';
import { TbApi, TbBrandPython } from 'react-icons/tb';
import { IconType } from 'react-icons';

interface SkillCategory {
  _id: string;
  name: string;
  displayOrder: number;
  isVisible: boolean;
}

interface Skill {
  _id: string;
  name: string;
  level: number;
  categoryId?: string;
  isHidden: boolean;
}

const DEFAULT_CATEGORIES = [
  'Développement Web',
  'Base de données & Backend',
  'Outils de Développement',
  'CMS & Frameworks',
  'Logiciels'
];

const getSkillIcon = (skillName: string): JSX.Element => {
  const icons: { [key: string]: IconType } = {
    'React': FaReact,
    'Node.js': FaNodeJs,
    'TypeScript': Si.SiTypescript,
    'JavaScript': Si.SiJavascript,
    'MongoDB': Si.SiMongodb,
    'PostgreSQL': Si.SiPostgresql,
    'Git': FaGit,
    'Docker': FaDocker,
    'AWS': FaAws,
    'Python': TbBrandPython,
    'Java': FaJava,
    'PHP': FaPhp,
    'Tailwind': Si.SiTailwindcss,
    'Next.js': Si.SiNextdotjs,
    'Adobe Photoshop': Si.SiAdobephotoshop,
    'Wordpress': FaWordpress,
    'API': TbApi,
    'GitLab': FaGitlab,
    'GitHub': FaGitlab,
    'NPM': FaNpm,
    'Composer': Si.SiComposer,
    'Flutter': Si.SiFlutter,
    'Microsoft Word': Si.SiMicrosoftword,
    'Microsoft Excel': Si.SiMicrosoftexcel,
    'Microsoft PowerPoint': Si.SiMicrosoftpowerpoint,
    'Adobe Premiere Pro': Si.SiAdobepremierepro,
    'Yarn': Si.SiYarn,
    'PIP': FaCode
  };

  const normalizedName = skillName.toLowerCase().trim();
  const Icon = Object.entries(icons).find(([key]) => 
    key.toLowerCase() === normalizedName
  )?.[1] || FaCode;

  return <Icon className="w-5 h-5" />;
};

export default function SkillCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchCategories();
      fetchSkills();
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

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des compétences');
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

        {/* Liste des catégories avec leurs compétences */}
        <div className="space-y-8">
          {categories.map((category) => {
            // Filtrer les compétences pour cette catégorie
            const categorySkills = skills.filter(skill => {
              const skillName = skill.name.toLowerCase();
              
              switch(category.name) {
                case 'Logiciels':
                  return skillName.includes('word') || 
                         skillName.includes('excel') || 
                         skillName.includes('powerpoint') ||
                         skillName.includes('photoshop') ||
                         skillName.includes('premiere') ||
                         skillName.includes('illustrator');
                
                case 'Développement Web':
                  return skillName.includes('html') || 
                         skillName.includes('css') || 
                         skillName.includes('javascript') ||
                         skillName.includes('typescript') ||
                         skillName.includes('react') ||
                         skillName.includes('vue') ||
                         skillName.includes('angular');
                
                case 'Base de données & Backend':
                  return skillName.includes('sql') || 
                         skillName.includes('mongo') || 
                         skillName.includes('postgres') ||
                         skillName.includes('mysql') ||
                         skillName.includes('mariadb') ||
                         skillName.includes('node') ||
                         skillName.includes('php');
                
                case 'Outils de Développement':
                  return skillName.includes('git') || 
                         skillName.includes('docker') || 
                         skillName.includes('npm') ||
                         skillName.includes('yarn') ||
                         skillName.includes('pip') ||
                         skillName.includes('composer');
                
                case 'CMS & Frameworks':
                  return skillName.includes('wordpress') || 
                         skillName.includes('tailwind') || 
                         skillName.includes('bootstrap') ||
                         skillName.includes('next') ||
                         skillName.includes('flutter');
                
                default:
                  return false;
              }
            });

            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                  <div className="h-0.5 w-full bg-gray-700 ml-4"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categorySkills.map((skill) => (
                    <motion.div
                      key={skill._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#1E1E1E] rounded-lg p-3 shadow-lg border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        {getSkillIcon(skill.name)}
                        <span className="text-sm font-medium text-white">
                          {skill.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

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