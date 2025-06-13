import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import EnhancedProjectCard from '@/components/projects/EnhancedProjectCard';
import ParticlesBackground from '@/components/effects/ParticlesBackground';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Experience from '@/models/Experience';
import Skill from '@/models/Skill';
import HomePage from '@/models/HomePage';
import { useRef, useEffect, useState } from 'react';
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaReact, 
  FaNodeJs, 
  FaGit, 
  FaDocker, 
  FaAws, 
  FaPython, 
  FaJava, 
  FaPhp,
  FaNpm,
  FaWordpress,
  FaGitlab,
  FaCode
} from 'react-icons/fa';
import { HiArrowDown } from 'react-icons/hi';
import { FiExternalLink, FiGithub, FiSettings, FiCode, FiStar, FiAlertTriangle, FiX } from 'react-icons/fi';
import parse from 'html-react-parser';
import { 
  SiTypescript, 
  SiJavascript, 
  SiMongodb, 
  SiPostgresql,
  SiTailwindcss,
  SiNextdotjs,
  SiAdobephotoshop,
  SiMicrosoftword,
  SiMicrosoftexcel,
  SiMicrosoftpowerpoint,
  SiAdobepremierepro,
  SiFlutter,
  SiComposer,
  SiYarn
} from 'react-icons/si';
import { TbApi, TbBrandPython } from 'react-icons/tb';
import SkillCategory from '@/models/SkillCategory';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import SkillsSection from '@/components/home/SkillsSection';

interface HomePageProps {
  projects: Array<{
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    demoUrl?: string;
    githubUrl?: string;
    featured?: boolean;
  }>;
  experiences: Array<{
    _id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    description: string;
    technologies: string[];
  }>;
  skills: Array<{
    _id: string;
    name: string;
    level: number;
    category: string;
  }>;
  homeData: {
    title: string;
    subtitle: string;
    aboutTitle: string;
    aboutText: string;
    socialLinks: {
      github: string;
      linkedin: string;
      twitter: string;
    };
  };
  skillsByCategory: Array<{
    _id: string;
    name: string;
    displayOrder: number;
    skills: Array<{
      _id: string;
      name: string;
      categoryId: {
        name: string;
        _id: string;
      };
      displayOrder: number;
    }>;
  }>;
}

const defaultHomeData = {
  _id: 'default',
  __v: 0,
  title: 'Bienvenue sur mon Portfolio',
  subtitle: 'Développeur Full Stack passionné par la création d\'applications web modernes et performantes',
  aboutTitle: 'À propos de moi',
  aboutText: 'Je suis un développeur Full Stack passionné par la création d\'applications web innovantes. Avec une solide expérience dans le développement front-end et back-end, je m\'efforce de créer des solutions élégantes et performantes qui répondent aux besoins des utilisateurs.',
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: ''
  }
};

const getIcon = (skillName: string) => {
  const icons: { [key: string]: JSX.Element } = {
    'React': <FaReact className="w-12 h-12" />,
    'Node.js': <FaNodeJs className="w-12 h-12" />,
    'TypeScript': <SiTypescript className="w-12 h-12" />,
    'JavaScript': <SiJavascript className="w-12 h-12" />,
    'MongoDB': <SiMongodb className="w-12 h-12" />,
    'PostgreSQL': <SiPostgresql className="w-12 h-12" />,
    'Git': <FaGit className="w-12 h-12" />,
    'Docker': <FaDocker className="w-12 h-12" />,
    'AWS': <FaAws className="w-12 h-12" />,
    'Python': <TbBrandPython className="w-12 h-12" />,
    'Java': <FaJava className="w-12 h-12" />,
    'PHP': <FaPhp className="w-12 h-12" />,
    'Tailwind': <SiTailwindcss className="w-12 h-12" />,
    'Next.js': <SiNextdotjs className="w-12 h-12" />,
    'Adobe Photoshop': <SiAdobephotoshop className="w-12 h-12" />,
    'Wordpress': <FaWordpress className="w-12 h-12" />,
    'API': <TbApi className="w-12 h-12" />,
    'GitLab': <FaGitlab className="w-12 h-12" />,
    'GitHub': <FaGithub className="w-12 h-12" />,
    'NPM': <FaNpm className="w-12 h-12" />,
    'Composer': <SiComposer className="w-12 h-12" />,
    'Flutter': <SiFlutter className="w-12 h-12" />,
    'Microsoft Word': <SiMicrosoftword className="w-12 h-12" />,
    'Microsoft Excel': <SiMicrosoftexcel className="w-12 h-12" />,
    'Microsoft PowerPoint': <SiMicrosoftpowerpoint className="w-12 h-12" />,
    'Adobe Premiere Pro': <SiAdobepremierepro className="w-12 h-12" />,
    'Yarn': <SiYarn className="w-12 h-12" />,
    'PIP': <FaCode className="w-12 h-12" />
  };
  
  const normalizedName = skillName.toLowerCase().trim();
  
  const icon = Object.entries(icons).find(([key]) => 
    key.toLowerCase() === normalizedName
  )?.[1];

  return icon || <FaCode className="w-12 h-12" />;
};

interface SkillCardProps {
  skill: {
    _id: string;
    name: string;
    level: number;
    category: string;
  };
  index: number;
  getIcon: (name: string) => JSX.Element;
}

const SkillCard = ({ skill, index, getIcon }: SkillCardProps) => (
  <motion.div
    key={skill._id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="group relative"
  >
    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:shadow-primary-500/20 flex flex-col items-center justify-center gap-3 hover:bg-gradient-to-br from-gray-700 to-gray-800">
      <div className="text-primary-500 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary-400">
        {getIcon(skill.name)}
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-400">
          {skill.name}
        </h3>
        <div className="mt-2 h-0.5 w-8 bg-primary-500 mx-auto rounded-full transform origin-left transition-all duration-300 group-hover:w-full"></div>
      </div>
    </div>
  </motion.div>
);

interface Category {
  _id: string;
  name: string;
  displayOrder: number;
}

interface Skill {
  _id: string;
  name: string;
  displayOrder: number;
  categoryId: Category | string | null;
}

export default function Home({ projects, experiences, skills, homeData = defaultHomeData, skillsByCategory }: HomePageProps) {
  const { t } = useTranslation(['common', 'home']);
  const { scrollYProgress } = useScroll();
  const mainRef = useRef<HTMLDivElement>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Limiter à 3 projets les plus visités (on peut utiliser featured ou un autre critère)
  const formattedProjects = projects
    .sort((a, b) => {
      // Prioriser les projets featured, puis par ordre de création
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    })
    .slice(0, 3)
    .map(project => ({
      ...project,
      image: project.imageUrl
    }));

  const scrollToContent = () => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fonctions pour gérer la modale
  const openModal = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const trackClick = async (projectId: string, type: 'demo' | 'github' | 'view') => {
    try {
      const response = await fetch('/api/projects/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, type }),
      });

      if (!response.ok) {
        return;
      }

      await response.json();
    } catch (error) {
      // Silently handle error
    }
  };

  const handleDemoClick = async (projectId: string, url: string) => {
    await trackClick(projectId, 'demo');
    window.open(url, '_blank');
  };

  const handleGithubClick = async (projectId: string, url: string) => {
    await trackClick(projectId, 'github');
    window.open(url, '_blank');
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          const projectId = entry.target.getAttribute('data-project-id');
          if (projectId) {
            await trackClick(projectId, 'view');
            observer.unobserve(entry.target);
          }
        }
      });
    });

    const projectElements = document.querySelectorAll('[data-project-id]');
    projectElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);

    // Afficher une notification de chargement
    const loadingToastId = toast.loading(
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <span>Envoi en cours...</span>
      </div>
    );

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          company: formData.get('company'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });

      if (response.ok) {
        // Succès : Remplacer la notification de chargement par une notification de succès
        toast.dismiss(loadingToastId);
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Message envoyé avec succès !
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-green-400">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-white/80 focus:outline-none"
              >
                <motion.svg
                  whileHover={{ rotate: 90 }}
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </motion.svg>
              </button>
            </div>
          </motion.div>
        ), {
          duration: 5000,
        });

        // Réinitialiser le formulaire
        form.reset();
        setIsSubmitting(false);
      } else {
        // Erreur : Afficher une notification d'erreur
        toast.dismiss(loadingToastId);
        setIsSubmitting(false);
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </motion.svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Erreur lors de l'envoi
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Veuillez réessayer ultérieurement.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-red-400">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-white/80 focus:outline-none"
              >
                <motion.svg
                  whileHover={{ rotate: 90 }}
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </motion.svg>
              </button>
            </div>
          </motion.div>
        ), {
          duration: 5000,
        });
      }
    } catch (error) {
      // Gérer l'erreur comme ci-dessus
      toast.dismiss(loadingToastId);
      toast.error('Erreur lors de l\'envoi du message');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Portfolio - Accueil</title>
        <meta name="description" content="Portfolio professionnel - Développeur Full Stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="flex items-center gap-3 bg-amber-500/90 text-amber-900 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm max-w-2xl">
              <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                Ce site est actuellement en cours de développement (version bêta). 
                Certaines fonctionnalités peuvent ne pas fonctionner correctement.
              </p>
              <button
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0 text-amber-900 hover:text-amber-950 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <ParticlesBackground />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-center z-10 px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6 leading-tight">
              {homeData.title}
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {homeData.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="/projects"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform"
              >
                <span>Voir mes projets</span>
                <motion.svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="#contact"
                className="inline-flex items-center px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform"
              >
                Me contacter
              </Link>
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex gap-6 justify-center mt-12"
          >
            {homeData.socialLinks.github && (
              <motion.a
                href={homeData.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <FaGithub className="w-6 h-6" />
              </motion.a>
            )}
            {homeData.socialLinks.linkedin && (
              <motion.a
                href={homeData.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <FaLinkedin className="w-6 h-6" />
              </motion.a>
            )}
            {homeData.socialLinks.twitter && (
              <motion.a
                href={homeData.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <FaTwitter className="w-6 h-6" />
              </motion.a>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-8"
        >
          <motion.button
            onClick={scrollToContent}
            whileHover={{ scale: 1.1, y: -2 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ 
              y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              scale: { type: "spring", stiffness: 400, damping: 17 }
            }}
            className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <HiArrowDown className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </section>

      <main ref={mainRef}>
        {/* About Section */}
        <section id="about" className="w-full py-16 sm:py-20 lg:py-24 px-4 bg-white dark:bg-gray-900 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-4">
                {homeData.aboutTitle}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            >
              <div className="space-y-6">
                <div className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed prose prose-lg dark:prose-invert max-w-none">
                  {parse(homeData.aboutText)}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-wrap gap-3 pt-4"
                >
                  {['Développement Web', 'UI/UX Design', 'Applications Mobiles', 'Consulting'].map((skill, index) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-300"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-700/20 rounded-2xl backdrop-blur-sm"></div>
                  <div className="relative z-10 text-white">
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                      >
                        <div className="text-3xl font-bold mb-2">50+</div>
                        <div className="text-sm opacity-90">Projets Réalisés</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                      >
                        <div className="text-3xl font-bold mb-2">3+</div>
                        <div className="text-sm opacity-90">Années d'Expérience</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                      >
                        <div className="text-3xl font-bold mb-2">100%</div>
                        <div className="text-sm opacity-90">Satisfaction Client</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                      >
                        <div className="text-3xl font-bold mb-2">24/7</div>
                        <div className="text-sm opacity-90">Support Disponible</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80"
                ></motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full opacity-80"
                ></motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Skills Section */}
        <SkillsSection />

        {/* Projects Section */}
        <section id="projects" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]"></div>
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 dark:from-white dark:to-purple-200 bg-clip-text text-transparent mb-4">
                Mes Projets
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Découvrez une sélection de mes réalisations récentes, alliant créativité et expertise technique.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {formattedProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  data-project-id={project._id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      width={500}
                      height={300}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {project.featured && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg"
                      >
                        <FiStar className="w-4 h-4" />
                        <span>Featured</span>
                      </motion.div>
                    )}
                    
                    {/* Overlay buttons */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {project.demoUrl && (
                        <motion.button
                          onClick={() => project.demoUrl && handleDemoClick(project._id, project.demoUrl)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-blue-600 hover:text-blue-700"
                        >
                          <FiExternalLink className="w-5 h-5" />
                        </motion.button>
                      )}
                      {project.githubUrl && (
                        <motion.button
                          onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          <FiGithub className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {project.description.length > 100 
                        ? `${project.description.substring(0, 100)}...` 
                        : project.description}
                      {project.description.length > 100 && (
                        <button
                          onClick={() => openModal(project)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline transition-colors duration-200"
                        >
                          lire plus
                        </button>
                      )}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech, techIndex) => (
                        <motion.span
                          key={techIndex}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: techIndex * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-300"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        {project.demoUrl && (
                          <motion.button
                            onClick={() => project.demoUrl && handleDemoClick(project._id, project.demoUrl)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            <span className="text-sm">Demo</span>
                          </motion.button>
                        )}
                        {project.githubUrl && (
                          <motion.button
                            onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200"
                          >
                            <FiGithub className="w-4 h-4" />
                            <span className="text-sm">Code</span>
                          </motion.button>
                        )}
                      </div>
                      
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {formattedProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCode className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Projets en cours de développement</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  De nouveaux projets passionnants arrivent bientôt. Restez connecté !
                </p>
              </motion.div>
            )}
            
            {/* Modal pour afficher les détails du projet */}
            {isModalOpen && selectedProject && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={closeModal}
              >
                <div 
                  className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={handleModalContentClick}
                >
                  {/* Header avec bouton de fermeture */}
                  <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedProject.title}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                    >
                      <FiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Contenu de la modale */}
                  <div className="p-6">
                    {/* Image du projet */}
                    <div className="mb-6">
                      <Image
                        src={selectedProject.imageUrl}
                        alt={selectedProject.title}
                        width={800}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Description complète */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>
                    
                    {/* Technologies */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Technologies utilisées
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Liens */}
                    <div className="flex gap-4">
                      {selectedProject.demoUrl && (
                        <a
                          href={selectedProject.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleDemoClick(selectedProject._id, selectedProject.demoUrl)}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <FiExternalLink className="w-5 h-5" />
                          Voir la démo
                        </a>
                      )}
                      {selectedProject.githubUrl && (
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleGithubClick(selectedProject._id, selectedProject.githubUrl)}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <FiGithub className="w-5 h-5" />
                          Voir le code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-teal-50/50 dark:from-green-900/10 dark:to-teal-900/10"></div>
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-r from-green-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-green-400/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-green-800 dark:from-white dark:to-green-200 bg-clip-text text-transparent mb-4">
                Mes Expériences
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-teal-500 mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Mon parcours professionnel et les compétences acquises au fil des années.
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              {experiences.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-teal-500 hidden md:block"></div>
                  
                  {experiences.map((experience, index) => (
                    <motion.div
                      key={experience._id}
                      initial={{ opacity: 0, y: 30, x: index % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="relative mb-12 md:mb-16"
                    >
                      {/* Timeline dot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                        viewport={{ once: true }}
                        className="absolute left-6 w-4 h-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg hidden md:block z-10"
                      ></motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`md:ml-16 bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-24'}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                          <div className="mb-2 lg:mb-0">
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              {experience.title}
                            </h3>
                            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                              <span className="font-semibold">{experience.company}</span>
                              <span className="mx-2">•</span>
                              <span>{experience.location}</span>
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                            viewport={{ once: true }}
                            className="flex-shrink-0"
                          >
                            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold border border-green-200 dark:border-green-700">
                              {new Date(experience.startDate).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }).replace('/', '-')} - {experience.endDate ? new Date(experience.endDate).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }).replace('/', '-') : 'Présent'}
                            </span>
                          </motion.div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                          {experience.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {experience.technologies.map((tech, techIndex) => (
                            <motion.span
                              key={tech}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.1 + techIndex * 0.05 + 0.4 }}
                              viewport={{ once: true }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-300"
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                        
                        {/* Decorative corner */}
                        <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full opacity-60"></div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Expériences en cours d'ajout</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                    Mon parcours professionnel sera bientôt détaillé ici.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"></div>
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-4">
                Contactez-moi
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Vous avez un projet en tête ? N'hésitez pas à me contacter pour en discuter.
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Restons en contact
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                      Je suis toujours ouvert aux nouvelles opportunités et collaborations. 
                      Que ce soit pour un projet, une question ou simplement pour échanger, 
                      n'hésitez pas à me contacter.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                        <p className="text-gray-600 dark:text-gray-300">contact@monportfolio.com</p>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Téléphone</h4>
                        <p className="text-gray-600 dark:text-gray-300">+33 6 XX XX XX XX</p>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Localisation</h4>
                        <p className="text-gray-600 dark:text-gray-300">France</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-700 rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-600"
                >
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    onSubmit={handleContactSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        viewport={{ once: true }}
                      >
                        <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400"
                          placeholder="Votre prénom"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        viewport={{ once: true }}
                      >
                        <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400"
                          placeholder="Votre nom"
                        />
                      </motion.div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        viewport={{ once: true }}
                      >
                        <label htmlFor="company" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Entreprise
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400"
                          placeholder="Votre entreprise"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        viewport={{ once: true }}
                      >
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400"
                          placeholder="Votre téléphone"
                        />
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400"
                        placeholder="votre.email@exemple.com"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                      viewport={{ once: true }}
                    >
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Sujet *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400"
                        placeholder="Sujet de votre message"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 resize-none hover:border-blue-400 dark:hover:border-blue-400"
                        placeholder="Décrivez votre projet ou votre demande..."
                      ></textarea>
                    </motion.div>
                    
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.45 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Envoyer le message</span>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';

  try {
    await connectDB();

    let homeData = await HomePage.findOne().lean();
    if (!homeData) {
      homeData = defaultHomeData;
    }

    // Récupérer les projets sélectionnés pour la page d'accueil
    const projects = await Project.aggregate([
      {
        $match: { 
          archived: { $ne: true },
          showOnHomepage: true
        }
      },
      {
        $addFields: {
          totalClicks: {
            $add: [
              { $ifNull: ['$stats.demoClicks', 0] },
              { $ifNull: ['$stats.githubClicks', 0] },
              { $ifNull: ['$stats.views', 0] }
            ]
          }
        }
      },
      {
        $sort: { 
          featured: -1,  // Projets featured en premier
          totalClicks: -1,  // Puis par popularité
          order: 1  // Puis par ordre défini
        }
      },
      {
        $limit: 6  // Augmenter la limite à 6 projets
      }
    ]);
    
    // Utiliser directement les 3 projets les plus populaires de la base de données
    const allProjects = projects;
    const experiences = await Experience.find({}).sort({ startDate: -1 }).select('title company location startDate endDate description technologies').lean();
    // Ensure technologies is an array, even if undefined
    const experiencesWithTechnologies = experiences.map(exp => ({
      ...exp,
      technologies: exp.technologies || []
    }));
    
    // Récupérer les catégories visibles sans doublons
    const allCategories = await SkillCategory.find({ isVisible: true })
      .sort('displayOrder')
      .lean();

    // Filtrer les catégories pour n'avoir que des noms uniques
    const uniqueCategories = allCategories.reduce<typeof allCategories>((acc, current) => {
      const exists = acc.find(cat => cat.name === current.name);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Récupérer les compétences non masquées
    const skills = await Skill.find({ isHidden: false })
      .populate('categoryId')
      .lean();

    // Associer les compétences aux catégories uniques
    const skillsByCategory = uniqueCategories.map(category => ({
      _id: category._id,
      name: category.name,
      displayOrder: category.displayOrder,
      skills: skills.filter(skill => (
        skill.categoryId && 
        typeof skill.categoryId === 'object' &&
        'name' in skill.categoryId &&
        (skill.categoryId as Category).name === category.name
      )).sort((a, b) => a.displayOrder - b.displayOrder)
    })).sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      props: {
        projects: JSON.parse(JSON.stringify(allProjects)),
        experiences: JSON.parse(JSON.stringify(experiencesWithTechnologies)),
        skills: JSON.parse(JSON.stringify(skills)),
        homeData: JSON.parse(JSON.stringify(homeData)),
        skillsByCategory: JSON.parse(JSON.stringify(skillsByCategory)),
        ...(await serverSideTranslations(currentLocale, ['common', 'home', 'projects', 'experiences'])),
      },
      revalidate: 1,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        projects: [],
        experiences: [],
        skills: [],
        homeData: defaultHomeData,
        skillsByCategory: [],
        ...(await serverSideTranslations(currentLocale, ['common', 'home', 'projects', 'experiences'])),
      },
      revalidate: 1,
    };
  }
};
