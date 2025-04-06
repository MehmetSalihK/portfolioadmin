import { 
  FaGithub, 
  FaLinkedin, 
  FaWhatsapp,
  FaSnapchat,
  FaInstagram,
  FaTelegram,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { SiX } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SocialLinksProps {
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    whatsapp?: string;
    snapchat?: string;
    instagram?: string;
    telegram?: string;
    phone?: string;
    email?: string;
  };
}

const formatSocialLink = (key: string, link: string): string => {
  if (!link) return '';

  // Supprimer les espaces inutiles
  const cleanLink = link.trim();

  // Si le lien commence déjà par http:// ou https://, le retourner tel quel
  if (cleanLink.startsWith('http://') || cleanLink.startsWith('https://')) {
    return cleanLink;
  }

  switch (key) {
    case 'email':
      return `mailto:${cleanLink}`;
    case 'phone':
      return `tel:${cleanLink}`;
    case 'whatsapp':
      return `https://wa.me/${cleanLink.replace(/[^0-9]/g, '')}`;
    case 'instagram':
      // Supprimer le @ initial si présent
      const username = cleanLink.startsWith('@') ? cleanLink.substring(1) : cleanLink;
      return `https://instagram.com/${username}`;
    case 'twitter':
      const twitterUsername = cleanLink.startsWith('@') ? cleanLink.substring(1) : cleanLink;
      return `https://x.com/${twitterUsername}`;
    case 'github':
      return `https://github.com/${cleanLink}`;
    case 'linkedin':
      // Si c'est déjà une URL complète, la retourner
      if (cleanLink.includes('linkedin.com')) return cleanLink;
      return `https://linkedin.com/in/${cleanLink}`;
    case 'telegram':
      const telegramUsername = cleanLink.startsWith('@') ? cleanLink.substring(1) : cleanLink;
      return `https://t.me/${telegramUsername}`;
    case 'snapchat':
      const snapUsername = cleanLink.startsWith('@') ? cleanLink.substring(1) : cleanLink;
      return `https://snapchat.com/add/${snapUsername}`;
    default:
      return cleanLink;
  }
};

const SocialLinks = ({ socialLinks }: SocialLinksProps) => {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const socialIcons = [
    { key: 'github', icon: FaGithub, link: socialLinks.github, label: 'GitHub' },
    { key: 'linkedin', icon: FaLinkedin, link: socialLinks.linkedin, label: 'LinkedIn' },
    { key: 'twitter', icon: SiX, link: socialLinks.twitter, label: 'X' },
    { key: 'instagram', icon: FaInstagram, link: socialLinks.instagram, label: 'Instagram' },
    { key: 'whatsapp', icon: FaWhatsapp, link: socialLinks.whatsapp, label: 'WhatsApp' },
    { key: 'snapchat', icon: FaSnapchat, link: socialLinks.snapchat, label: 'Snapchat' },
    { key: 'telegram', icon: FaTelegram, link: socialLinks.telegram, label: 'Telegram' },
    { key: 'phone', icon: FaPhone, link: socialLinks.phone, label: 'Téléphone' },
    { key: 'email', icon: FaEnvelope, link: socialLinks.email, label: 'Email' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {socialIcons.map((social, index) => {
        if (!social.link) return null;
        
        const Icon = social.icon;
        const href = formatSocialLink(social.key, social.link);
        if (!href) return null;

        return (
          <motion.div
            key={social.key}
            className="relative"
            onHoverStart={() => setHoveredIcon(social.key)}
            onHoverEnd={() => setHoveredIcon(null)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <motion.a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-6 h-6 text-gray-300 hover:text-primary-500 transition-colors duration-300" />
            </motion.a>

            <AnimatePresence>
              {hoveredIcon === social.key && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap z-10"
                >
                  {social.label}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-black/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SocialLinks; 