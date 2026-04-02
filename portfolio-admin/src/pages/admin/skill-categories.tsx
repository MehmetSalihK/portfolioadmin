import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiMove, FiEye, FiEyeOff, FiCode, FiLayers, FiTag, FiCheck, FiX, FiLoader, FiZap, FiSettings } from 'react-icons/fi';
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

  return <Icon />;
};

export default function SkillCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => { if (status === 'unauthenticated') router.push('/admin/login'); }, [status, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/skill-categories');
      if (response.ok) {
        const data = await response.json();
        const uniqueCategories = data.filter((category: SkillCategory, index: number, self: SkillCategory[]) =>
          index === self.findIndex((c) => c.name === category.name)
        );
        setCategories(uniqueCategories);
      }
    } catch (e) { toast.error('Erreur chargement'); }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (e) { toast.error('Erreur compétences'); }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([fetchCategories(), fetchSkills()]).finally(() => setLoading(false));
    }
  }, [status, fetchCategories, fetchSkills]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
        toast.error('Catégorie existante'); return;
      }
      const response = await fetch('/api/admin/skill-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, displayOrder: categories.length }),
      });
      if (response.ok) {
        const newCat = await response.json();
        setCategories([...categories, newCat]);
        setNewCategoryName('');
        setIsAddingCategory(false);
        toast.success('Catégorie ajoutée');
      }
    } catch (e) { toast.error('Erreur ajout'); }
  };

  const toggleVisibility = async (categoryId: string, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/skill-categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible }),
      });
      if (response.ok) {
        setCategories(prev => prev.map(cat => cat._id === categoryId ? { ...cat, isVisible } : cat));
        toast.success(isVisible ? 'Affichée' : 'Masquée');
      }
    } catch (e) { toast.error('Erreur visibilité'); }
  };

  const initializeDefaultCategories = async () => {
    setLoading(true);
    try {
      const existingNames = categories.map(cat => cat.name.toLowerCase());
      const toAdd = DEFAULT_CATEGORIES.filter(name => !existingNames.includes(name.toLowerCase()));
      for (const name of toAdd) {
        await fetch('/api/admin/skill-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, displayOrder: DEFAULT_CATEGORIES.indexOf(name) }),
        });
      }
      await fetchCategories();
      toast.success('Initialisation terminée');
    } catch (e) { toast.error('Erreur initialisation'); } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
           <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-4">Architecture des compétences…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                   <FiLayers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-500">Taxonomie & Classement</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Catégories de Skills</h1>
             <p className="text-slate-500 font-medium max-w-lg">Organisez vos compétences techniques par domaines d'expertise pour un affichage optimisé.</p>
           </div>

           <div className="flex gap-4">
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                 <Link href="/admin/skills" className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white">Skills</Link>
                 <Link href="/admin/skill-categories" className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white dark:bg-primary-500 text-primary-500 dark:text-white shadow-premium">Categories</Link>
              </div>
           </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-10">
           {categories.map((category, idx) => {
              const categorySkills = skills.filter(skill => {
                 const name = skill.name.toLowerCase();
                 if (category.name === 'Logiciels') return name.includes('word') || name.includes('excel') || name.includes('powerpoint') || name.includes('photoshop') || name.includes('premiere') || name.includes('illustrator');
                 if (category.name === 'Développement Web') return name.includes('html') || name.includes('css') || name.includes('javascript') || name.includes('typescript') || name.includes('react') || name.includes('vue') || name.includes('angular');
                 if (category.name === 'Base de données & Backend') return name.includes('sql') || name.includes('mongo') || name.includes('postgres') || name.includes('mysql') || name.includes('mariadb') || name.includes('node') || name.includes('php');
                 if (category.name === 'Outils de Développement') return name.includes('git') || name.includes('docker') || name.includes('npm') || name.includes('yarn') || name.includes('pip') || name.includes('composer');
                 if (category.name === 'CMS & Frameworks') return name.includes('wordpress') || name.includes('tailwind') || name.includes('bootstrap') || name.includes('next') || name.includes('flutter');
                 return false;
              });

              return (
                <motion.div key={category._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group">
                  <div className="flex items-center gap-6 mb-6">
                     <div className="h-0.5 grow bg-slate-100 dark:bg-white/5" />
                     <div className="flex items-center gap-3">
                        <FiTag className="text-primary-500 w-4 h-4" />
                        <h2 className="text-xl font-black dark:text-white text-slate-900 uppercase tracking-tight">{category.name}</h2>
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-0.5 rounded-full text-slate-400">{categorySkills.length}</span>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => toggleVisibility(category._id, !category.isVisible)} className={`p-2 rounded-xl transition-all shadow-sm ${category.isVisible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                           {category.isVisible ? <FiEye /> : <FiEyeOff />}
                        </button>
                        <button className="p-2 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-rose-500 transition-all"><FiTrash2 /></button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                     <AnimatePresence>
                        {categorySkills.map((skill, sIdx) => (
                          <motion.div key={skill._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[24px] p-5 flex flex-col items-center gap-4 hover:shadow-premium transition-all duration-300 group/skill cursor-default relative overflow-hidden">
                             <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover/skill:opacity-100 transition-opacity" />
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/skill:text-primary-500 group-hover/skill:scale-110 group-hover/skill:rotate-12 transition-all text-2xl">
                                {getSkillIcon(skill.name)}
                             </div>
                             <span className="text-xs font-black dark:text-slate-300 text-slate-700 text-center line-clamp-1">{skill.name}</span>
                          </motion.div>
                        ))}
                     </AnimatePresence>
                     
                     <motion.button onClick={() => router.push('/admin/skills')} className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[24px] p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary-500/30 hover:text-primary-500 transition-all group/add">
                        <FiPlus className="w-6 h-6 group-hover/add:scale-125 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Connecter</span>
                     </motion.button>
                  </div>
                </motion.div>
              );
           })}
        </div>

        {/* Actions Section */}
        <div className="bg-white dark:bg-background-card/40 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="space-y-2">
              <h3 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">Outils d'Organisation</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gérez la structure globale de vos compétences.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {categories.length === 0 ? (
                 <button onClick={initializeDefaultCategories} className="px-8 py-4 bg-emerald-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                    <FiZap /> Initialiser la structure par défaut
                 </button>
              ) : (
                 <button onClick={() => setIsAddingCategory(true)} className="px-10 py-4 bg-primary-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3">
                    <FiPlus /> Définir une nouvelle catégorie
                 </button>
              )}
           </div>
        </div>

        {/* Simple Add Modal Redesign */}
        <AnimatePresence>
           {isAddingCategory && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-[#0f0f15] border border-white/10 rounded-[40px] p-10 w-full max-w-lg shadow-2xl relative">
                   <div className="flex items-center justify-between mb-10">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Nouveau Domaine</span>
                         <h2 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight">Catégorie</h2>
                      </div>
                      <button onClick={() => setIsAddingCategory(false)} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><FiX className="w-6 h-6"/></button>
                   </div>

                   <form onSubmit={handleAddCategory} className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la catégorie</label>
                         <input autoFocus value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold dark:text-white text-slate-900 text-sm" placeholder="Ex: Machine Learning" />
                      </div>
                      
                      <div className="flex gap-4 pt-4">
                         <button type="submit" className="flex-1 bg-primary-500 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/25 transition-all">Créer la section</button>
                         <button type="button" onClick={() => setIsAddingCategory(false)} className="px-8 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-[24px] font-black uppercase text-sm tracking-widest">Annuler</button>
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