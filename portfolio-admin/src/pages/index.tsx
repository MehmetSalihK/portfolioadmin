import { motion, useScroll, useTransform } from 'framer-motion';
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
import { FiExternalLink, FiGithub, FiSettings, FiCode, FiStar, FiAlertTriangle, FiX, FiArrowRight, FiDownload } from 'react-icons/fi';
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
import { AnimatePresence } from 'framer-motion';
import SkillsSection from '@/components/home/SkillsSection';
import SocialLinks from '@/components/home/SocialLinks';
import HeroSection from '@/components/home/HeroSection';

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
      instagram: string;
      whatsapp: string;
      snapchat: string;
      telegram: string;
      phone: string;
      email: string;
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
    twitter: '',
    instagram: '',
    whatsapp: '',
    snapchat: '',
    telegram: '',
    phone: '',
    email: ''
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

  const formattedProjects = projects.map(project => ({
    ...project,
    image: project.imageUrl
  }));

  const scrollToContent = () => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      } else {
        // Erreur : Afficher une notification d'erreur
        toast.dismiss(loadingToastId);
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
    }
  };

  return (
    <Layout>
      <Head>
        <title>Portfolio - Développeur Full Stack</title>
        <meta name="description" content={homeData.subtitle} />
      </Head>

      {/* Section Héro */}
      <HeroSection
        title={homeData.title}
        subtitle={homeData.subtitle}
        socialLinks={homeData.socialLinks}
        onScrollClick={scrollToContent}
      />

      <main ref={mainRef} className="bg-white dark:bg-gray-900">
        {/* Section À propos */}
        <section id="about" className="relative py-16 md:py-24 overflow-hidden">
          {/* Cercles décoratifs */}
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                {homeData.aboutTitle}
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {parse(homeData.aboutText)}
              </div>
              <div className="mt-8 flex justify-center">
                <Button href="/cv.pdf" variant="secondary" size="lg" className="group">
                  <span>Télécharger mon CV</span>
                  <FiDownload className="ml-2 group-hover:translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section Compétences */}
        <SkillsSection skillsByCategory={skillsByCategory} />

        {/* Section Expériences */}
        <section id="experiences" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Mes Expériences
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Découvrez mon parcours professionnel
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative pl-8 pb-12 last:pb-0"
                >
                  {/* Ligne verticale */}
                  {index !== experiences.length - 1 && (
                    <div className="absolute left-[11px] top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  {/* Point */}
                  <div className="absolute left-0 top-3 w-6 h-6 rounded-full border-4 border-primary-500 bg-white dark:bg-gray-900" />
                  
                  <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-lg dark:shadow-gray-900/10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {experience.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {experience.company} • {experience.location}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      {experience.startDate} - {experience.endDate || 'Présent'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {experience.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {experience.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Projets */}
        <section id="projects" className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Mes Projets
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Découvrez une sélection de mes projets les plus récents et significatifs
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EnhancedProjectCard project={project} />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button href="/projects" variant="secondary" size="lg" className="group">
                <span>Voir tous les projets</span>
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Section Contact */}
        <section id="contact" className="py-16 md:py-24 bg-[#0f172a]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Me Contacter
                </h2>
                <p className="text-gray-400 mb-8">
                  Une idée de projet ? N'hésitez pas à me contacter !
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#1d2432] rounded-xl p-6 md:p-8 shadow-xl"
              >
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Prénom *</label>
                      <input
                        type="text"
                        placeholder="John"
                        className="w-full px-4 py-2 bg-[#2a3441] text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nom *</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        className="w-full px-4 py-2 bg-[#2a3441] text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Société <span className="text-gray-500">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Entreprise SA"
                        className="w-full px-4 py-2 bg-[#2a3441] text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Téléphone <span className="text-gray-500">(optionnel)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Téléphone"
                        className="w-full px-4 py-2 bg-[#2a3441] text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email *</label>
                    <input
                      type="email"
                      placeholder="email@exemple.com"
                      className="w-full px-4 py-2 bg-[#2a3441] text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Sujet *</label>
                    <input
                      type="text"
                      placeholder="Sujet de votre message"
                      className="w-full px-4 py-2 bg-[#2a3441] text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Message *</label>
                    <textarea
                      placeholder="Votre message..."
                      rows={4}
                      className="w-full px-4 py-2 bg-[#2a3441] text-white placeholder-gray-500 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                      required
                    ></textarea>
                  </div>

                  <div className="text-center">
                    <Button type="submit" variant="primary" size="lg">
                      Envoyer
                    </Button>
                  </div>
                </form>
              </motion.div>
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

    const projects = await Project.find({}).lean();
    const experiences = await Experience.find({}).sort({ startDate: -1 }).lean();
    
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
        projects: JSON.parse(JSON.stringify(projects)),
        experiences: JSON.parse(JSON.stringify(experiences)),
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
