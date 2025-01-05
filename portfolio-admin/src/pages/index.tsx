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
import { FiExternalLink, FiGithub, FiSettings, FiCode } from 'react-icons/fi';
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

interface HomePageProps {
  projects: Array<{
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    demoUrl?: string;
    githubUrl?: string;
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
            <h2 className="text-4xl font-bold text-center mb-16">
              {t('home:skills.title')}
            </h2>
            
            {skillsByCategory.map((category) => (
              <div key={category._id} className="mb-12">
                <h3 className="text-2xl font-semibold mb-6">
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {category.skills.map((skill) => (
                    <SkillCard
                      key={skill._id}
                      skill={skill}
                      getIcon={getIcon}
                    />
                  ))}
                </div>
              </div>
            ))}
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
                    <img
                      src={project.imageUrl}
                      alt={project.title}
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
                          onClick={() => handleDemoClick(project._id, project.demoUrl)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          <FiExternalLink className="w-5 h-5" />
                          <span>Demo</span>
                        </button>
                      )}
                      {project.githubUrl && (
                        <button
                          onClick={() => handleGithubClick(project._id, project.githubUrl)}
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
        <section id="contact" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('home:contact.title')}
                </h2>
              </div>
              <motion.form
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-6 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
              >
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <input
                    type="text"
                    name="name"
                    placeholder={t('home:contact.namePlaceholder')}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 transition-colors duration-300"
                  />
                </motion.div>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <input
                    type="email"
                    name="email"
                    placeholder={t('home:contact.emailPlaceholder')}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 transition-colors duration-300"
                  />
                </motion.div>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={t('home:contact.messagePlaceholder')}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 transition-colors duration-300"
                  ></textarea>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button type="submit" variant="primary" size="lg" className="w-full">
                    {t('home:contact.submitButton')}
                  </Button>
                </motion.div>
              </motion.form>
            </motion.div>
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
    
    const categories = await SkillCategory.find({ isVisible: true })
      .sort('displayOrder')
      .lean();

    const skills = await Skill.find({ isHidden: false })
      .populate('categoryId')
      .lean();

    const uniqueCategories = new Map();
    categories.forEach(category => {
      if (!uniqueCategories.has(category._id.toString())) {
        uniqueCategories.set(category._id.toString(), {
          ...category,
          skills: skills.filter(skill => 
            skill.categoryId && skill.categoryId._id.toString() === category._id.toString()
          )
        });
      }
    });

    const skillsByCategory = Array.from(uniqueCategories.values());

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

// Créez un nouveau composant SkillCard pour la carte de compétence
const SkillCard = ({ skill, index, getIcon }) => (
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
