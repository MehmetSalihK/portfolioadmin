import { useState, useEffect } from 'react';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiTrash2, FiCode, FiCheck, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import * as Si from 'react-icons/si';
import { IconType } from 'react-icons';

interface Skill {
  _id: string;
  name: string;
  level: number;
  category: string;
  isVisible: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// Types de catégories
type SkillCategory = 
  | 'Langages de programmation'
  | 'Frameworks'
  | "Systèmes d'exploitation"
  | 'Bases de données'
  | 'Outils de design'
  | 'Outils de développement'
  | 'Services Cloud'
  | 'Outils DevOps'
  | 'Outils de collaboration'
  | 'Outils de bureautique'
  | 'Autres';

// Interface pour les informations de technologie
interface TechInfo {
  icon: IconType;
  fullName: string;
  aliases: string[];
  category: SkillCategory;
}

// Mapping des technologies avec leurs catégories
const techMapping: Record<string, TechInfo> = {
  // Langages de programmation
  'javascript': { 
    icon: Si.SiJavascript, 
    fullName: 'JavaScript',
    aliases: ['js', 'javascript', 'javascripts', 'javascript.js'],
    category: 'Langages de programmation'
  },
  'typescript': { 
    icon: Si.SiTypescript, 
    fullName: 'TypeScript',
    aliases: ['ts', 'typescript', 'typescript.ts'],
    category: 'Langages de programmation'
  },
  'python': { 
    icon: Si.SiPython, 
    fullName: 'Python',
    aliases: ['py', 'python', 'python3'],
    category: 'Langages de programmation'
  },
  'java': { 
    icon: Si.SiJava, 
    fullName: 'Java',
    aliases: ['java', 'java8', 'java11', 'java17'],
    category: 'Langages de programmation'
  },
  'php': {
    icon: Si.SiPhp,
    fullName: 'PHP',
    aliases: ['php', 'php7', 'php8'],
    category: 'Langages de programmation'
  },
  'html': { 
    icon: Si.SiHtml5, 
    fullName: 'HTML',
    aliases: ['html', 'html5', 'html 5'],
    category: 'Langages de programmation'
  },
  'css': { 
    icon: Si.SiCss3, 
    fullName: 'CSS',
    aliases: ['css', 'css3', 'css 3'],
    category: 'Langages de programmation'
  },
  'sass': {
    icon: Si.SiSass,
    fullName: 'Sass',
    aliases: ['sass', 'scss'],
    category: 'Langages de programmation'
  },
  'dart': {
    icon: Si.SiDart,
    fullName: 'Dart',
    aliases: ['dart', 'dart lang', 'Dart'],
    category: 'Langages de programmation'
  },
  'kotlin': {
    icon: Si.SiKotlin,
    fullName: 'Kotlin',
    aliases: ['kotlin', 'kotlin lang', 'Kotlin'],
    category: 'Langages de programmation'
  },
  'swift': {
    icon: Si.SiSwift,
    fullName: 'Swift',
    aliases: ['swift', 'swift lang', 'Swift'],
    category: 'Langages de programmation'
  },

  // Frameworks
  'react': { 
    icon: Si.SiReact, 
    fullName: 'React',
    aliases: ['react', 'reactjs', 'react.js'],
    category: 'Frameworks'
  },
  'reactnative': { 
    icon: Si.SiReact, 
    fullName: 'React Native',
    aliases: ['react native', 'reactnative', 'react-native', 'rn'],
    category: 'Frameworks'
  },
  'vue': { 
    icon: Si.SiVuedotjs, 
    fullName: 'Vue.js',
    aliases: ['vue', 'vuejs', 'vue.js', 'vue3'],
    category: 'Frameworks'
  },
  'angular': { 
    icon: Si.SiAngular, 
    fullName: 'Angular',
    aliases: ['ng', 'angular', 'angularjs', 'angular.js'],
    category: 'Frameworks'
  },
  'next': { 
    icon: Si.SiNextdotjs, 
    fullName: 'Next.js',
    aliases: ['next', 'nextjs', 'next.js', 'next js'],
    category: 'Frameworks'
  },
  'node': { 
    icon: Si.SiNodedotjs, 
    fullName: 'Node.js',
    aliases: ['node', 'nodejs', 'node.js', 'node js'],
    category: 'Frameworks'
  },
  'django': { 
    icon: Si.SiDjango, 
    fullName: 'Django',
    aliases: ['django', 'django3', 'django4'],
    category: 'Frameworks'
  },
  'laravel': {
    icon: Si.SiLaravel,
    fullName: 'Laravel',
    aliases: ['laravel', 'laravel9'],
    category: 'Frameworks'
  },
  'tailwind': { 
    icon: Si.SiTailwindcss, 
    fullName: 'Tailwind CSS',
    aliases: ['tailwind', 'tailwindcss', 'tailwind css', 'tailwind-css'],
    category: 'Frameworks'
  },
  'bootstrap': { 
    icon: Si.SiBootstrap, 
    fullName: 'Bootstrap',
    aliases: ['bootstrap', 'bootstrap5', 'bootstrap 5'],
    category: 'Frameworks'
  },
  'flutter': {
    icon: Si.SiFlutter,
    fullName: 'Flutter',
    aliases: ['flutter', 'flutter sdk', 'Flutter'],
    category: 'Frameworks'
  },
  'xamarin': {
    icon: Si.SiXamarin,
    fullName: 'Xamarin',
    aliases: ['xamarin', 'xamarin forms', 'Xamarin'],
    category: 'Frameworks'
  },
  'wordpress': {
    icon: Si.SiWordpress,
    fullName: 'WordPress',
    aliases: ['wordpress', 'wp', 'WordPress'],
    category: 'Frameworks'
  },
  'drupal': {
    icon: Si.SiDrupal,
    fullName: 'Drupal',
    aliases: ['drupal', 'Drupal'],
    category: 'Frameworks'
  },
  'joomla': {
    icon: Si.SiJoomla,
    fullName: 'Joomla',
    aliases: ['joomla', 'Joomla'],
    category: 'Frameworks'
  },
  'woocommerce': {
    icon: Si.SiWoo,
    fullName: 'WooCommerce',
    aliases: ['woocommerce', 'woo', 'WooCommerce'],
    category: 'Frameworks'
  },
  'shopify': {
    icon: Si.SiShopify,
    fullName: 'Shopify',
    aliases: ['shopify', 'Shopify'],
    category: 'Frameworks'
  },

  // Bases de données
  'mysql': { 
    icon: Si.SiMysql, 
    fullName: 'MySQL',
    aliases: ['mysql', 'my-sql', 'my sql'],
    category: 'Bases de données'
  },
  'mariadb': {
    icon: Si.SiMariadb,
    fullName: 'MariaDB',
    aliases: ['mariadb', 'maria', 'maria-db', 'maria db'],
    category: 'Bases de données'
  },
  'postgresql': {
    icon: Si.SiPostgresql,
    fullName: 'PostgreSQL',
    aliases: ['postgres', 'postgresql', 'psql', 'postgre'],
    category: 'Bases de données'
  },
  'mongodb': { 
    icon: Si.SiMongodb, 
    fullName: 'MongoDB',
    aliases: ['mongo', 'mongodb', 'mongo db'],
    category: 'Bases de données'
  },
  'redis': {
    icon: Si.SiRedis,
    fullName: 'Redis',
    aliases: ['redis', 'redis-db', 'redis db'],
    category: 'Bases de données'
  },
  'sqlite': {
    icon: Si.SiSqlite,
    fullName: 'SQLite',
    aliases: ['sqlite', 'sqlite3', 'sql lite'],
    category: 'Bases de données'
  },

  // Systèmes d'exploitation
  'windows': {
    icon: Si.SiWindows,
    fullName: 'Windows',
    aliases: ['windows', 'windows 10', 'windows 11', 'win', 'win10', 'win11'],
    category: "Systèmes d'exploitation"
  },
  'linux': {
    icon: Si.SiLinux,
    fullName: 'Linux',
    aliases: ['linux', 'gnu linux', 'gnu/linux'],
    category: "Systèmes d'exploitation"
  },
  'ubuntu': {
    icon: Si.SiUbuntu,
    fullName: 'Ubuntu',
    aliases: ['ubuntu', 'ubuntu linux'],
    category: "Systèmes d'exploitation"
  },
  'debian': {
    icon: Si.SiDebian,
    fullName: 'Debian',
    aliases: ['debian', 'debian linux'],
    category: "Systèmes d'exploitation"
  },
  'kali': {
    icon: Si.SiKalilinux,
    fullName: 'Kali Linux',
    aliases: ['kali', 'kali linux', 'kalilinux'],
    category: "Systèmes d'exploitation"
  },
  'macos': {
    icon: Si.SiApple,
    fullName: 'macOS',
    aliases: ['mac', 'macos', 'mac os', 'osx', 'mac os x', 'apple'],
    category: "Systèmes d'exploitation"
  },

  // Outils de design
  'photoshop': {
    icon: Si.SiAdobephotoshop,
    fullName: 'Adobe Photoshop',
    aliases: ['photoshop', 'adobe photoshop', 'ps', 'Adobe Photoshop'],
    category: 'Outils de design'
  },
  'illustrator': {
    icon: Si.SiAdobeillustrator,
    fullName: 'Adobe Illustrator',
    aliases: ['illustrator', 'adobe illustrator', 'ai', 'Adobe Illustrator'],
    category: 'Outils de design'
  },
  'premiere': {
    icon: Si.SiAdobepremierepro,
    fullName: 'Adobe Premiere Pro',
    aliases: ['premiere', 'premiere pro', 'adobe premiere', 'pr', 'Adobe Premiere Pro'],
    category: 'Outils de design'
  },
  'aftereffects': {
    icon: Si.SiAdobeaftereffects,
    fullName: 'Adobe After Effects',
    aliases: ['after effects', 'adobe after effects', 'ae', 'Adobe After Effects'],
    category: 'Outils de design'
  },
  'indesign': {
    icon: Si.SiAdobeindesign,
    fullName: 'Adobe InDesign',
    aliases: ['indesign', 'adobe indesign', 'id', 'Adobe InDesign'],
    category: 'Outils de design'
  },
  'xd': {
    icon: Si.SiAdobexd,
    fullName: 'Adobe XD',
    aliases: ['xd', 'adobe xd', 'Adobe XD'],
    category: 'Outils de design'
  },
  'figma': {
    icon: Si.SiFigma,
    fullName: 'Figma',
    aliases: ['figma', 'figma design'],
    category: 'Outils de design'
  },
  'sketch': {
    icon: Si.SiSketch,
    fullName: 'Sketch',
    aliases: ['sketch', 'sketch app'],
    category: 'Outils de design'
  },

  // Outils de développement
  'vscode': {
    icon: Si.SiVisualstudiocode,
    fullName: 'Visual Studio Code',
    aliases: ['vscode', 'vs code', 'visual studio code'],
    category: 'Outils de développement'
  },
  'git': { 
    icon: Si.SiGit, 
    fullName: 'Git',
    aliases: ['git', 'git-scm'],
    category: 'Outils de développement'
  },
  'github': {
    icon: Si.SiGithub,
    fullName: 'GitHub',
    aliases: ['github', 'gh', 'GitHub'],
    category: 'Outils de développement'
  },
  'gitlab': {
    icon: Si.SiGitlab,
    fullName: 'GitLab',
    aliases: ['gitlab', 'gl', 'GitLab'],
    category: 'Outils de développement'
  },
  'bitbucket': {
    icon: Si.SiBitbucket,
    fullName: 'Bitbucket',
    aliases: ['bitbucket', 'bb', 'Bitbucket'],
    category: 'Outils de développement'
  },
  'postman': {
    icon: Si.SiPostman,
    fullName: 'Postman',
    aliases: ['postman', 'postman api'],
    category: 'Outils de développement'
  },

  // Gestionnaires de paquets
  'composer': {
    icon: Si.SiComposer,
    fullName: 'Composer',
    aliases: ['composer', 'php composer', 'Composer'],
    category: 'Outils de développement'
  },
  'npm': {
    icon: Si.SiNpm,
    fullName: 'NPM',
    aliases: ['npm', 'node package manager', 'NPM'],
    category: 'Outils de développement'
  },
  'yarn': {
    icon: Si.SiYarn,
    fullName: 'Yarn',
    aliases: ['yarn', 'yarn package manager', 'Yarn'],
    category: 'Outils de développement'
  },
  'pip': {
    icon: Si.SiPypi,
    fullName: 'PIP',
    aliases: ['pip', 'python pip', 'PIP'],
    category: 'Outils de développement'
  },

  // Services Cloud
  'aws': {
    icon: Si.SiAmazonaws,
    fullName: 'AWS',
    aliases: ['aws', 'amazon aws', 'amazon web services'],
    category: 'Services Cloud'
  },
  'firebase': {
    icon: Si.SiFirebase,
    fullName: 'Firebase',
    aliases: ['firebase', 'google firebase'],
    category: 'Services Cloud'
  },

  // Outils DevOps
  'docker': { 
    icon: Si.SiDocker, 
    fullName: 'Docker',
    aliases: ['docker', 'docker-compose', 'dockerfile'],
    category: 'Outils DevOps'
  },
  'kubernetes': {
    icon: Si.SiKubernetes,
    fullName: 'Kubernetes',
    aliases: ['k8s', 'kubernetes', 'kube'],
    category: 'Outils DevOps'
  },

  // Outils de collaboration
  'slack': {
    icon: Si.SiSlack,
    fullName: 'Slack',
    aliases: ['slack', 'slack app'],
    category: 'Outils de collaboration'
  },
  'discord': {
    icon: Si.SiDiscord,
    fullName: 'Discord',
    aliases: ['discord', 'discord app'],
    category: 'Outils de collaboration'
  },
  'teams': {
    icon: Si.SiMicrosoftteams,
    fullName: 'Microsoft Teams',
    aliases: ['teams', 'ms teams', 'microsoft teams'],
    category: 'Outils de collaboration'
  },
  'jira': {
    icon: Si.SiJira,
    fullName: 'Jira',
    aliases: ['jira', 'jira software', 'atlassian jira'],
    category: 'Outils de collaboration'
  },
  'notion': {
    icon: Si.SiNotion,
    fullName: 'Notion',
    aliases: ['notion', 'notion app'],
    category: 'Outils de collaboration'
  },

  // Microsoft Office
  'excel': {
    icon: Si.SiMicrosoftexcel,
    fullName: 'Microsoft Excel',
    aliases: ['excel', 'ms excel', 'microsoft excel', 'Excel', 'Microsoft Excel'],
    category: 'Outils de bureautique'
  },
  'word': {
    icon: Si.SiMicrosoftword,
    fullName: 'Microsoft Word',
    aliases: ['word', 'ms word', 'microsoft word', 'Word', 'Microsoft Word'],
    category: 'Outils de bureautique'
  },
  'powerpoint': {
    icon: Si.SiMicrosoftpowerpoint,
    fullName: 'Microsoft PowerPoint',
    aliases: ['powerpoint', 'ms powerpoint', 'microsoft powerpoint', 'PowerPoint', 'Microsoft PowerPoint'],
    category: 'Outils de bureautique'
  },
  'office': {
    icon: Si.SiMicrosoftoffice,
    fullName: 'Microsoft Office',
    aliases: ['office', 'ms office', 'microsoft office', 'Office', 'Microsoft Office'],
    category: 'Outils de bureautique'
  },

  // APIs et Protocoles
  'rest-api': {
    icon: Si.SiOpenapiinitiative,
    fullName: 'REST API',
    aliases: ['rest', 'rest api', 'restful', 'restful api', 'api', 'API'],
    category: 'Outils de développement'
  },
  'graphql': {
    icon: Si.SiGraphql,
    fullName: 'GraphQL',
    aliases: ['graphql', 'graph ql', 'GraphQL'],
    category: 'Outils de développement'
  },
  'swagger': {
    icon: Si.SiSwagger,
    fullName: 'Swagger',
    aliases: ['swagger', 'openapi', 'swagger ui', 'Swagger'],
    category: 'Outils de développement'
  },
  'soap': {
    icon: Si.SiSoap,
    fullName: 'SOAP',
    aliases: ['soap', 'soap api', 'SOAP'],
    category: 'Outils de développement'
  },
  'websocket': {
    icon: Si.SiWebsocket,
    fullName: 'WebSocket',
    aliases: ['websocket', 'ws', 'WebSocket'],
    category: 'Outils de développement'
  },
};

// Fonction pour normaliser le nom de la compétence
const normalizeSkillName = (input: string): string => {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const tech of Object.values(techMapping)) {
    if (tech.aliases.some(alias => normalizedInput === alias)) {
      return tech.fullName;
    }
  }
  
  // Si aucune correspondance n'est trouvée, on retourne le nom avec la première lettre en majuscule
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
};

// Fonction pour obtenir l'icône correspondante
const getSkillIcon = (skillName: string): IconType => {
  const normalizedName = skillName.toLowerCase().trim();
  
  // Recherche exacte d'abord
  for (const tech of Object.values(techMapping)) {
    if (tech.aliases.some(alias => normalizedName === alias)) {
      return tech.icon;
    }
  }
  
  // Si pas de correspondance exacte, recherche partielle
  for (const tech of Object.values(techMapping)) {
    if (tech.aliases.some(alias => normalizedName.includes(alias))) {
      return tech.icon;
    }
  }
  
  return FiCode; // Icône par défaut si aucune correspondance n'est trouvée
};

// Fonction pour obtenir la catégorie d'une compétence
const getSkillCategory = (skillName: string): SkillCategory => {
  const normalizedInput = skillName.toLowerCase().trim();
  
  for (const tech of Object.values(techMapping)) {
    // Vérifier le nom complet
    if (tech.fullName.toLowerCase() === normalizedInput) {
      return tech.category;
    }
    // Vérifier les alias
    if (tech.aliases.some(alias => alias.toLowerCase() === normalizedInput)) {
      return tech.category;
    }
  }
  return 'Autres';
};

// Fonction pour grouper les compétences par catégorie
const groupSkillsByCategory = (skills: Skill[]): Record<SkillCategory, Skill[]> => {
  const grouped: Partial<Record<SkillCategory, Skill[]>> = {};
  
  skills.forEach(skill => {
    const category = getSkillCategory(skill.name);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category]!.push(skill);
  });

  // Trier les compétences dans chaque catégorie
  Object.keys(grouped).forEach(category => {
    grouped[category as SkillCategory]?.sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  });

  return grouped as Record<SkillCategory, Skill[]>;
};

// Fonction pour détecter automatiquement la catégorie
const detectCategory = (skillName: string): string => {
  const name = skillName.toLowerCase();
  
  // Langages de programmation
  if (name.includes('javascript') || name.includes('python') || name.includes('java') || 
      name.includes('typescript') || name.includes('php') || name.includes('ruby') || 
      name.includes('swift') || name.includes('kotlin') || name.includes('c++') || 
      name.includes('c#') || name.includes('go')) {
    return 'Langages de programmation';
  }
  
  // Frameworks
  if (name.includes('react') || name.includes('vue') || name.includes('angular') || 
      name.includes('next') || name.includes('nuxt') || name.includes('express') || 
      name.includes('django') || name.includes('flask') || name.includes('laravel') ||
      name.includes('spring') || name.includes('flutter') || name.includes('tailwind')) {
    return 'Frameworks';
  }
  
  // Systèmes d'exploitation
  if (name.includes('windows') || name.includes('linux') || name.includes('macos') || 
      name.includes('ubuntu') || name.includes('android') || name.includes('ios')) {
    return 'Systèmes d\'exploitation';
  }
  
  // Bases de données
  if (name.includes('sql') || name.includes('mongo') || name.includes('postgres') || 
      name.includes('mysql') || name.includes('oracle') || name.includes('redis') ||
      name.includes('firebase')) {
    return 'Bases de données';
  }
  
  // Outils de design
  if (name.includes('photoshop') || name.includes('illustrator') || name.includes('figma') || 
      name.includes('sketch') || name.includes('xd') || name.includes('after') || 
      name.includes('premiere') || name.includes('indesign')) {
    return 'Outils de design';
  }
  
  // Outils de développement
  if (name.includes('git') || name.includes('docker') || name.includes('vscode') || 
      name.includes('intellij') || name.includes('eclipse') || name.includes('postman')) {
    return 'Outils de développement';
  }
  
  // Services Cloud
  if (name.includes('aws') || name.includes('azure') || name.includes('google cloud') || 
      name.includes('heroku') || name.includes('vercel') || name.includes('netlify')) {
    return 'Services Cloud';
  }
  
  // Par défaut
  return 'Autres';
};

export default function SkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [newSkillCategory, setNewSkillCategory] = useState('Autres');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextToastId, setNextToastId] = useState(0);

  // Fonction pour ajouter un toast
  const addToast = ({ message, type }: Omit<Toast, 'id'>) => {
    const newToast = {
      id: nextToastId,
      message,
      type,
    };
    setToasts(prevToasts => [...prevToasts, newToast]);
    setNextToastId(prevId => prevId + 1);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== newToast.id));
    }, 3000);
  };

  // Fonction pour mettre à jour la visibilité d'une compétence
  const toggleSkillVisibility = async (skillId: string, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible }),
      });

      if (!response.ok) {
        throw new Error('Failed to update skill visibility');
      }

      // Mise à jour locale de l'état
      setSkills(prevSkills => 
        prevSkills.map(skill => 
          skill._id === skillId ? { ...skill, isVisible } : skill
        )
      );

      // Afficher un toast de succès
      addToast({
        message: 'Visibilité mise à jour avec succès',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating skill visibility:', error);
      addToast({
        message: 'Erreur lors de la mise à jour de la visibilité',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else {
      fetchSkills();
    }
  }, [status]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 2000);
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      showToast('Failed to fetch skills', 'error');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const category = detectCategory(newSkillName);
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSkillName,
          level: 50, // Valeur par défaut
          category: category,
          isVisible: true
        }),
      });

      if (!response.ok) throw new Error('Failed to add skill');

      const newSkill = await response.json();
      setSkills([...skills, newSkill]);
      setIsAddingSkill(false);
      setNewSkillName('');
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleDelete = async () => {
    if (!skillToDelete) return;

    try {
      const response = await fetch(`/api/skills/${skillToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSkills();
        showToast('Skill deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      showToast('Failed to delete skill', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSkillToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FiCode className="w-8 h-8 text-gray-300" />
            <h1 className="text-2xl font-bold text-white">Skills Management</h1>
          </div>
          <button
            onClick={() => setIsAddingSkill(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <FiPlus className="text-white" /> Add Skill
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupSkillsByCategory(skills)).map(([category, skills]) => (
            skills.length > 0 && (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-white">{category}</h2>
                  <span className="text-sm text-gray-400">({skills.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-[#1E1E1E] rounded-lg p-3 shadow-lg border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-200 hover:shadow-xl group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const Icon = getSkillIcon(skill.name);
                            return Icon && <Icon className="text-xl text-gray-300 group-hover:text-white transition-colors duration-200" />;
                          })()}
                          <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors duration-200">
                            {skill.name}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          {/* Bouton de visibilité */}
                          <button
                            onClick={() => toggleSkillVisibility(skill._id, !skill.isVisible)}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                              skill.isVisible 
                                ? 'bg-[#2A2A2A] hover:bg-[#333333] hover:scale-110' 
                                : 'bg-[#1A1A1A] hover:bg-[#222222] hover:scale-110'
                            }`}
                            title={skill.isVisible ? 'Visible sur le portfolio' : 'Masqué sur le portfolio'}
                          >
                            {skill.isVisible ? 
                              <FiEye className="text-gray-300 hover:text-white transition-colors duration-200 w-4 h-4" /> : 
                              <FiEyeOff className="text-gray-500 hover:text-white transition-colors duration-200 w-4 h-4" />
                            }
                          </button>
                          {/* Bouton de suppression */}
                          <button
                            onClick={() => {
                              setSkillToDelete(skill);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          ))}
        </div>

        <AnimatePresence>
          {isAddingSkill && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Add New Skill</h2>
                  <button
                    onClick={() => setIsAddingSkill(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
                <form onSubmit={handleAddSkill}>
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#252525] text-white rounded border border-[#2A2A2A] focus:border-[#404040] focus:outline-none transition-colors duration-200"
                      placeholder="Enter skill name (e.g., React, Python, Photoshop)"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-lg transition-colors duration-200"
                    >
                      Add Skill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isDeleteModalOpen && skillToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center mb-4">
                  <FiAlertCircle className="text-red-400 text-2xl mr-3" />
                  <h2 className="text-xl font-bold text-white">Delete Skill</h2>
                </div>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete "{skillToDelete.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete()}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
