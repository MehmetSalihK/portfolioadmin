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
import { useRef, useEffect } from 'react';
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
import { FiExternalLink, FiGithub, FiSettings, FiCode, FiStar } from 'react-icons/fi';
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
    skills: Array<{
      _id: string;
      name: string;
      level: number;
      category: string;
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

export default function Home({ projects, experiences, skills, homeData = defaultHomeData, skillsByCategory }: HomePageProps) {
  const { t } = useTranslation(['common', 'home']);
  const { scrollYProgress } = useScroll();
  const mainRef = useRef<HTMLDivElement>(null);

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
        <title>Portfolio - Accueil</title>
        <meta name="description" content="Portfolio professionnel - Développeur Full Stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <ParticlesBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center z-10 px-4"
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
          >
            {homeData.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            {homeData.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button href="#projects" variant="primary" size="lg">
              Voir mes projets
            </Button>
            <Button href="#contact" variant="outline" size="lg">
              Me contacter
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex justify-center space-x-6"
          >
            {homeData.socialLinks.github && (
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href={homeData.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
              >
                <FaGithub className="w-6 h-6" />
              </motion.a>
            )}
            {homeData.socialLinks.linkedin && (
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href={homeData.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
              >
                <FaLinkedin className="w-6 h-6" />
              </motion.a>
            )}
            {homeData.socialLinks.twitter && (
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href={homeData.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
              >
                <FaTwitter className="w-6 h-6" />
              </motion.a>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="absolute bottom-8"
        >
          <motion.button
            onClick={scrollToContent}
            whileHover={{ y: 5 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
          >
            <HiArrowDown className="w-8 h-8" />
          </motion.button>
        </motion.div>
      </section>

      <main ref={mainRef}>
        {/* About Section */}
        <section id="about" className="w-full py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">{homeData.aboutTitle}</h2>
            <div className="text-lg text-gray-400 prose prose-invert max-w-none">
              {parse(homeData.aboutText)}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home:skills.title')}
              </h2>
            </motion.div>

            {/* Affichage des catégories et leurs compétences */}
            <div className="space-y-16">
              {skillsByCategory.map((category) => (
                <div key={category._id} className="mb-12">
                  <div className="flex items-center mb-8">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <div className="h-0.5 w-full bg-gray-700 ml-4"></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {category.skills.map((skill, index) => (
                      <SkillCard
                        key={skill._id}
                        skill={skill}
                        index={index}
                        getIcon={getIcon}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home:projects.title')}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {formattedProjects.map((project) => (
                <motion.div
                  key={project._id}
                  data-project-id={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-gradient-to-br from-[#1E1E1E] to-[#252525] rounded-xl overflow-hidden"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      width={500}
                      height={300}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {project.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-500/90 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                        <FiStar className="w-4 h-4" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#2A2A2A] text-gray-300 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      {project.demoUrl && (
                        <button
                          onClick={() => project.demoUrl && handleDemoClick(project._id, project.demoUrl)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          <FiExternalLink className="w-5 h-5" />
                          <span>Demo</span>
                        </button>
                      )}
                      {project.githubUrl && (
                        <button
                          onClick={() => project.githubUrl && handleGithubClick(project._id, project.githubUrl)}
                          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                        >
                          <FiGithub className="w-5 h-5" />
                          <span>GitHub</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home:experience.title')}
              </h2>
            </motion.div>
            <div className="max-w-3xl mx-auto">
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience._id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative mb-8"
                >
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {experience.title}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {experience.startDate} - {experience.endDate || 'Present'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {experience.company} • {experience.location}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {experience.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {experience.technologies.map((tech) => (
                        <motion.span
                          key={tech}
                          whileHover={{ scale: 1.1 }}
                          className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-8 sm:py-12 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          {/* Effet de grille en arrière-plan */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-grid-white/[0.1]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-6 sm:mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Me Contacter
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
                Une idée de projet ? N'hésitez pas à me contacter !
              </p>
            </motion.div>

            <div className="max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-xl"
              >
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {/* Nom et Prénom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
                        placeholder="John"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Société et Téléphone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                        Société <span className="text-gray-500 text-xs">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
                        placeholder="Entreprise SA"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                        Téléphone <span className="text-gray-500 text-xs">(optionnel)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
                        placeholder="Téléphone"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>

                  {/* Sujet */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      Sujet *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
                      placeholder="Sujet de votre message"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 resize-none text-sm"
                      placeholder="Votre message..."
                      required
                    ></textarea>
                  </div>

                  {/* Bouton d'envoi */}
                  <div className="text-center pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Envoyer
                    </button>
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
      skills: skills.filter(skill => 
        skill.categoryId && 
        skill.categoryId.name === category.name // Utiliser le nom au lieu de l'ID
      )
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
