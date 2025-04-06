import { motion } from 'framer-motion';
import { HiArrowDown } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import ParticlesBackground from '@/components/effects/ParticlesBackground';
import SocialLinks from './SocialLinks';
import Image from 'next/image';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    whatsapp?: string;
    snapchat?: string;
    telegram?: string;
    phone?: string;
    email?: string;
  };
  onScrollClick: () => void;
}

const HeroSection = ({ title, subtitle, socialLinks, onScrollClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Fond avec particules */}
      <ParticlesBackground />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

      {/* Cercles décoratifs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge animé */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white border border-white/20">
              Disponible pour des projets freelance
            </span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button href="#projects" variant="primary" size="lg">
              Voir mes projets
            </Button>
            <Button href="#contact" variant="secondary" size="lg">
              Me contacter
            </Button>
          </motion.div>

          {/* Liens sociaux */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <SocialLinks socialLinks={socialLinks} />
          </motion.div>
        </motion.div>
      </div>

      {/* Flèche de défilement */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        onClick={onScrollClick}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 hover:text-white transition-colors duration-300 cursor-pointer"
      >
        <HiArrowDown className="w-8 h-8 animate-bounce" />
      </motion.button>
    </section>
  );
};

export default HeroSection; 