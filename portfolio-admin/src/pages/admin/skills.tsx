import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiTrash2, FiCode, FiCheck, FiAlertCircle, FiEye, FiEyeOff, FiList } from 'react-icons/fi';
import { 
  SiJavascript, 
  SiTypescript, 
  SiPython, 
  SiApache,
  SiPhp, 
  SiHtml5,
  SiCss3,
  SiSass,
  SiDart,
  SiKotlin,
  SiSwift,
  SiReact,
  SiVuedotjs,
  SiAngular,
  SiNextdotjs,
  SiNodedotjs,
  SiDjango,
  SiLaravel,
  SiTailwindcss,
  SiBootstrap,
  SiFlutter,
  SiXamarin,
  SiWordpress,
  SiDrupal,
  SiJoomla,
  SiWoo,
  SiShopify,
  SiMysql,
  SiMariadb,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiSqlite,
  SiWindows,
  SiLinux,
  SiUbuntu,
  SiDebian,
  SiKalilinux,
  SiApple,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiAdobepremierepro,
  SiAdobeaftereffects,
  SiAdobeindesign,
  SiAdobexd,
  SiFigma,
  SiSketch,
  SiVisualstudiocode,
  SiGit,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiPostman,
  SiComposer,
  SiNpm,
  SiYarn,
  SiPypi,
  SiAmazonaws,
  SiFirebase,
  SiDocker,
  SiKubernetes,
  SiSlack,
  SiDiscord,
  SiMicrosoftteams,
  SiJira,
  SiNotion,
  SiMicrosoftexcel,
  SiMicrosoftword,
  SiMicrosoftpowerpoint,
  SiMicrosoftoffice,
  SiOpenapiinitiative,
  SiGraphql,
  SiSwagger,
  SiSap,
  SiRsocket
} from 'react-icons/si';
import { IconType } from 'react-icons';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Head from 'next/head';
import SkillsManagement from '@/components/admin/skills/SkillsManagement';

interface Skill {
  _id: string;
  name: string;
  level: number;
  category: string;
  isHidden: boolean;
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
    icon: SiJavascript, 
    fullName: 'JavaScript',
    aliases: ['js', 'javascript', 'javascripts', 'javascript.js'],
    category: 'Langages de programmation'
  },
  'typescript': { 
    icon: SiTypescript, 
    fullName: 'TypeScript',
    aliases: ['ts', 'typescript', 'typescript.ts'],
    category: 'Langages de programmation'
  },
  'python': { 
    icon: SiPython, 
    fullName: 'Python',
    aliases: ['py', 'python', 'python3'],
    category: 'Langages de programmation'
  },
  'java': { 
    icon: SiApache, 
    fullName: 'Java',
    aliases: ['java', 'java8', 'java11', 'java17'],
    category: 'Langages de programmation'
  },
  'php': {
    icon: SiPhp,
    fullName: 'PHP',
    aliases: ['php', 'php7', 'php8'],
    category: 'Langages de programmation'
  },
  'html': { 
    icon: SiHtml5, 
    fullName: 'HTML',
    aliases: ['html', 'html5', 'html 5'],
    category: 'Langages de programmation'
  },
  'css': { 
    icon: SiCss3, 
    fullName: 'CSS',
    aliases: ['css', 'css3', 'css 3'],
    category: 'Langages de programmation'
  },
  'sass': {
    icon: SiSass,
    fullName: 'Sass',
    aliases: ['sass', 'scss'],
    category: 'Langages de programmation'
  },
  'dart': {
    icon: SiDart,
    fullName: 'Dart',
    aliases: ['dart', 'dart lang', 'Dart'],
    category: 'Langages de programmation'
  },
  'kotlin': {
    icon: SiKotlin,
    fullName: 'Kotlin',
    aliases: ['kotlin', 'kotlin lang', 'Kotlin'],
    category: 'Langages de programmation'
  },
  'swift': {
    icon: SiSwift,
    fullName: 'Swift',
    aliases: ['swift', 'swift lang', 'Swift'],
    category: 'Langages de programmation'
  },

  // Frameworks
  'react': { 
    icon: SiReact, 
    fullName: 'React',
    aliases: ['react', 'reactjs', 'react.js'],
    category: 'Frameworks'
  },
  'reactnative': { 
    icon: SiReact, 
    fullName: 'React Native',
    aliases: ['react native', 'reactnative', 'react-native', 'rn'],
    category: 'Frameworks'
  },
  'vue': { 
    icon: SiVuedotjs, 
    fullName: 'Vue.js',
    aliases: ['vue', 'vuejs', 'vue.js', 'vue3'],
    category: 'Frameworks'
  },
  'angular': { 
    icon: SiAngular, 
    fullName: 'Angular',
    aliases: ['ng', 'angular', 'angularjs', 'angular.js'],
    category: 'Frameworks'
  },
  'next': { 
    icon: SiNextdotjs, 
    fullName: 'Next.js',
    aliases: ['next', 'nextjs', 'next.js', 'next js'],
    category: 'Frameworks'
  },
  'node': { 
    icon: SiNodedotjs, 
    fullName: 'Node.js',
    aliases: ['node', 'nodejs', 'node.js', 'node js'],
    category: 'Frameworks'
  },
  'django': { 
    icon: SiDjango, 
    fullName: 'Django',
    aliases: ['django', 'django3', 'django4'],
    category: 'Frameworks'
  },
  'laravel': {
    icon: SiLaravel,
    fullName: 'Laravel',
    aliases: ['laravel', 'laravel9'],
    category: 'Frameworks'
  },
  'tailwind': { 
    icon: SiTailwindcss, 
    fullName: 'Tailwind CSS',
    aliases: ['tailwind', 'tailwindcss', 'tailwind css', 'tailwind-css'],
    category: 'Frameworks'
  },
  'bootstrap': { 
    icon: SiBootstrap, 
    fullName: 'Bootstrap',
    aliases: ['bootstrap', 'bootstrap5', 'bootstrap 5'],
    category: 'Frameworks'
  },
  'flutter': {
    icon: SiFlutter,
    fullName: 'Flutter',
    aliases: ['flutter', 'flutter sdk', 'Flutter'],
    category: 'Frameworks'
  },
  'xamarin': {
    icon: SiXamarin,
    fullName: 'Xamarin',
    aliases: ['xamarin', 'xamarin forms', 'Xamarin'],
    category: 'Frameworks'
  },
  'wordpress': {
    icon: SiWordpress,
    fullName: 'WordPress',
    aliases: ['wordpress', 'wp', 'WordPress'],
    category: 'Frameworks'
  },
  'drupal': {
    icon: SiDrupal,
    fullName: 'Drupal',
    aliases: ['drupal', 'Drupal'],
    category: 'Frameworks'
  },
  'joomla': {
    icon: SiJoomla,
    fullName: 'Joomla',
    aliases: ['joomla', 'Joomla'],
    category: 'Frameworks'
  },
  'woocommerce': {
    icon: SiWoo,
    fullName: 'WooCommerce',
    aliases: ['woocommerce', 'woo', 'WooCommerce'],
    category: 'Frameworks'
  },
  'shopify': {
    icon: SiShopify,
    fullName: 'Shopify',
    aliases: ['shopify', 'Shopify'],
    category: 'Frameworks'
  },

  // Bases de données
  'mysql': { 
    icon: SiMysql, 
    fullName: 'MySQL',
    aliases: ['mysql', 'my-sql', 'my sql'],
    category: 'Bases de données'
  },
  'mariadb': {
    icon: SiMariadb,
    fullName: 'MariaDB',
    aliases: ['mariadb', 'maria', 'maria-db', 'maria db'],
    category: 'Bases de données'
  },
  'postgresql': {
    icon: SiPostgresql,
    fullName: 'PostgreSQL',
    aliases: ['postgres', 'postgresql', 'psql', 'postgre'],
    category: 'Bases de données'
  },
  'mongodb': { 
    icon: SiMongodb, 
    fullName: 'MongoDB',
    aliases: ['mongo', 'mongodb', 'mongo db'],
    category: 'Bases de données'
  },
  'redis': {
    icon: SiRedis,
    fullName: 'Redis',
    aliases: ['redis', 'redis-db', 'redis db'],
    category: 'Bases de données'
  },
  'sqlite': {
    icon: SiSqlite,
    fullName: 'SQLite',
    aliases: ['sqlite', 'sqlite3', 'sql lite'],
    category: 'Bases de données'
  },

  // Systèmes d'exploitation
  'windows': {
    icon: SiWindows,
    fullName: 'Windows',
    aliases: ['windows', 'windows 10', 'windows 11', 'win', 'win10', 'win11'],
    category: "Systèmes d'exploitation"
  },
  'linux': {
    icon: SiLinux,
    fullName: 'Linux',
    aliases: ['linux', 'gnu linux', 'gnu/linux'],
    category: "Systèmes d'exploitation"
  },
  'ubuntu': {
    icon: SiUbuntu,
    fullName: 'Ubuntu',
    aliases: ['ubuntu', 'ubuntu linux'],
    category: "Systèmes d'exploitation"
  },
  'debian': {
    icon: SiDebian,
    fullName: 'Debian',
    aliases: ['debian', 'debian linux'],
    category: "Systèmes d'exploitation"
  },
  'kali': {
    icon: SiKalilinux,
    fullName: 'Kali Linux',
    aliases: ['kali', 'kali linux', 'kalilinux'],
    category: "Systèmes d'exploitation"
  },
  'macos': {
    icon: SiApple,
    fullName: 'macOS',
    aliases: ['mac', 'macos', 'mac os', 'osx', 'mac os x', 'apple'],
    category: "Systèmes d'exploitation"
  },

  // Outils de design
  'photoshop': {
    icon: SiAdobephotoshop,
    fullName: 'Adobe Photoshop',
    aliases: ['photoshop', 'adobe photoshop', 'ps', 'Adobe Photoshop'],
    category: 'Outils de design'
  },
  'illustrator': {
    icon: SiAdobeillustrator,
    fullName: 'Adobe Illustrator',
    aliases: ['illustrator', 'adobe illustrator', 'ai', 'Adobe Illustrator'],
    category: 'Outils de design'
  },
  'premiere': {
    icon: SiAdobepremierepro,
    fullName: 'Adobe Premiere Pro',
    aliases: ['premiere', 'premiere pro', 'adobe premiere', 'pr', 'Adobe Premiere Pro'],
    category: 'Outils de design'
  },
  'aftereffects': {
    icon: SiAdobeaftereffects,
    fullName: 'Adobe After Effects',
    aliases: ['after effects', 'adobe after effects', 'ae', 'Adobe After Effects'],
    category: 'Outils de design'
  },
  'indesign': {
    icon: SiAdobeindesign,
    fullName: 'Adobe InDesign',
    aliases: ['indesign', 'adobe indesign', 'id', 'Adobe InDesign'],
    category: 'Outils de design'
  },
  'xd': {
    icon: SiAdobexd,
    fullName: 'Adobe XD',
    aliases: ['xd', 'adobe xd', 'Adobe XD'],
    category: 'Outils de design'
  },
  'figma': {
    icon: SiFigma,
    fullName: 'Figma',
    aliases: ['figma', 'figma design'],
    category: 'Outils de design'
  },
  'sketch': {
    icon: SiSketch,
    fullName: 'Sketch',
    aliases: ['sketch', 'sketch app'],
    category: 'Outils de design'
  },

  // Outils de développement
  'vscode': {
    icon: SiVisualstudiocode,
    fullName: 'Visual Studio Code',
    aliases: ['vscode', 'vs code', 'visual studio code'],
    category: 'Outils de développement'
  },
  'git': { 
    icon: SiGit, 
    fullName: 'Git',
    aliases: ['git', 'git-scm'],
    category: 'Outils de développement'
  },
  'github': {
    icon: SiGithub,
    fullName: 'GitHub',
    aliases: ['github', 'gh', 'GitHub'],
    category: 'Outils de développement'
  },
  'gitlab': {
    icon: SiGitlab,
    fullName: 'GitLab',
    aliases: ['gitlab', 'gl', 'GitLab'],
    category: 'Outils de développement'
  },
  'bitbucket': {
    icon: SiBitbucket,
    fullName: 'Bitbucket',
    aliases: ['bitbucket', 'bb', 'Bitbucket'],
    category: 'Outils de développement'
  },
  'postman': {
    icon: SiPostman,
    fullName: 'Postman',
    aliases: ['postman', 'postman api'],
    category: 'Outils de développement'
  },

  // Gestionnaires de paquets
  'composer': {
    icon: SiComposer,
    fullName: 'Composer',
    aliases: ['composer', 'php composer', 'Composer'],
    category: 'Outils de développement'
  },
  'npm': {
    icon: SiNpm,
    fullName: 'NPM',
    aliases: ['npm', 'node package manager', 'NPM'],
    category: 'Outils de développement'
  },
  'yarn': {
    icon: SiYarn,
    fullName: 'Yarn',
    aliases: ['yarn', 'yarn package manager', 'Yarn'],
    category: 'Outils de développement'
  },
  'pip': {
    icon: SiPypi,
    fullName: 'PIP',
    aliases: ['pip', 'python pip', 'PIP'],
    category: 'Outils de développement'
  },

  // Services Cloud
  'aws': {
    icon: SiAmazonaws,
    fullName: 'AWS',
    aliases: ['aws', 'amazon aws', 'amazon web services'],
    category: 'Services Cloud'
  },
  'firebase': {
    icon: SiFirebase,
    fullName: 'Firebase',
    aliases: ['firebase', 'google firebase'],
    category: 'Services Cloud'
  },

  // Outils DevOps
  'docker': { 
    icon: SiDocker, 
    fullName: 'Docker',
    aliases: ['docker', 'docker-compose', 'dockerfile'],
    category: 'Outils DevOps'
  },
  'kubernetes': {
    icon: SiKubernetes,
    fullName: 'Kubernetes',
    aliases: ['k8s', 'kubernetes', 'kube'],
    category: 'Outils DevOps'
  },

  // Outils de collaboration
  'slack': {
    icon: SiSlack,
    fullName: 'Slack',
    aliases: ['slack', 'slack app'],
    category: 'Outils de collaboration'
  },
  'discord': {
    icon: SiDiscord,
    fullName: 'Discord',
    aliases: ['discord', 'discord app'],
    category: 'Outils de collaboration'
  },
  'teams': {
    icon: SiMicrosoftteams,
    fullName: 'Microsoft Teams',
    aliases: ['teams', 'ms teams', 'microsoft teams'],
    category: 'Outils de collaboration'
  },
  'jira': {
    icon: SiJira,
    fullName: 'Jira',
    aliases: ['jira', 'jira software', 'atlassian jira'],
    category: 'Outils de collaboration'
  },
  'notion': {
    icon: SiNotion,
    fullName: 'Notion',
    aliases: ['notion', 'notion app'],
    category: 'Outils de collaboration'
  },

  // Microsoft Office
  'excel': {
    icon: SiMicrosoftexcel,
    fullName: 'Microsoft Excel',
    aliases: ['excel', 'ms excel', 'microsoft excel', 'Excel', 'Microsoft Excel'],
    category: 'Outils de bureautique'
  },
  'word': {
    icon: SiMicrosoftword,
    fullName: 'Microsoft Word',
    aliases: ['word', 'ms word', 'microsoft word', 'Word', 'Microsoft Word'],
    category: 'Outils de bureautique'
  },
  'powerpoint': {
    icon: SiMicrosoftpowerpoint,
    fullName: 'Microsoft PowerPoint',
    aliases: ['powerpoint', 'ms powerpoint', 'microsoft powerpoint', 'PowerPoint', 'Microsoft PowerPoint'],
    category: 'Outils de bureautique'
  },
  'office': {
    icon: SiMicrosoftoffice,
    fullName: 'Microsoft Office',
    aliases: ['office', 'ms office', 'microsoft office', 'Office', 'Microsoft Office'],
    category: 'Outils de bureautique'
  },

  // APIs et Protocoles
  'rest-api': {
    icon: SiOpenapiinitiative,
    fullName: 'REST API',
    aliases: ['rest', 'rest api', 'restful', 'restful api', 'api', 'API'],
    category: 'Outils de développement'
  },
  'graphql': {
    icon: SiGraphql,
    fullName: 'GraphQL',
    aliases: ['graphql', 'graph ql', 'GraphQL'],
    category: 'Outils de développement'
  },
  'swagger': {
    icon: SiSwagger,
    fullName: 'Swagger',
    aliases: ['swagger', 'openapi', 'swagger ui', 'Swagger'],
    category: 'Outils de développement'
  },
  'soap': {
    icon: SiSap,
    fullName: 'SOAP',
    aliases: ['soap', 'soap api', 'SOAP'],
    category: 'Outils de développement'
  },
  'websocket': {
    icon: SiRsocket,
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
const groupSkillsByCategory = (skills: Skill[]) => {
  const grouped: { [key: string]: Skill[] } = {};
  skills.forEach(skill => {
    const categoryName = skill.category || 'Non catégorisé';
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(skill);
  });
  return grouped;
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

export default function AdminSkills() {
  return (
    <AdminLayout>
      <Head>
        <title>Gestion des compétences - Admin</title>
      </Head>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Skills Management</h1>
        <SkillsManagement />
      </div>
    </AdminLayout>
  );
}
