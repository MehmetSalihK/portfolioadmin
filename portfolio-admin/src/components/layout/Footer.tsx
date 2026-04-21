import Link from 'next/link';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { FiMail, FiCode } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next/pages';

interface FooterSettings {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  siteTitle?: string;
}

const Footer = () => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<FooterSettings>({});

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.projects'), path: '/projects' },
    { name: t('nav.education'), path: '/formations' },
    { name: t('nav.experience'), path: '/experiences' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  useEffect(() => {
    const cached = localStorage.getItem('adminSettings');
    if (cached) {
      try { setSettings(JSON.parse(cached)); } catch {}
    }
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
  }, []);

  const socialLinks = [
    { name: 'GitHub', href: settings.github, icon: FaGithub },
    { name: 'LinkedIn', href: settings.linkedin, icon: FaLinkedin },
    { name: 'Twitter', href: settings.twitter, icon: FaTwitter },
    { name: 'Email', href: settings.email ? `mailto:${settings.email}` : undefined, icon: FiMail },
  ].filter(s => s.href);

  return (
    <footer className="dark:bg-[#09090f] bg-zinc-50 dark:border-white/5 border-zinc-200 border-t transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-600/30">
                S
              </div>
              <span className="dark:text-white text-zinc-900 font-black tracking-tight">
                {settings.siteTitle || 'Portfolio'}
              </span>
            </div>
            <p className="dark:text-zinc-600 text-zinc-500 text-sm font-medium leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] font-black dark:text-zinc-600 text-zinc-500 uppercase tracking-widest mb-4">{t('footer.navigation')}</p>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="dark:text-zinc-500 text-zinc-600 dark:hover:text-white hover:text-zinc-900 text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div>
            <p className="text-[10px] font-black dark:text-zinc-600 text-zinc-500 uppercase tracking-widest mb-4">{t('footer.find_me')}</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(item => (
                <Link
                  key={item.name}
                  href={item.href!}
                  target={item.name !== 'Email' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 dark:bg-white/5 bg-zinc-100 dark:hover:bg-white/10 hover:bg-zinc-200 dark:border-white/5 border-zinc-200 border dark:hover:border-white/10 hover:border-zinc-300 rounded-xl dark:text-zinc-500 text-zinc-600 dark:hover:text-white hover:text-zinc-900 transition-all text-sm font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 dark:border-white/5 border-zinc-200 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="dark:text-zinc-700 text-zinc-400 text-xs font-medium">
            © {currentYear} Portfolio. {t('footer.rights')}.
          </p>
          <div className="flex items-center gap-1.5 dark:text-zinc-700 text-zinc-400 text-xs font-medium">
            <FiCode className="w-3.5 h-3.5" />
            {t('footer.built_with')} Next.js · TypeScript · MongoDB
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
