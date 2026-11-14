import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { FiMail, FiArrowUpRight, FiCode } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next/pages';
import { DimensionMark } from '@/components/identity/Marks';

interface FooterSettings {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  siteTitle?: string;
}

const dimensions = [
  { key: '01', labelKey: 'footer.dim1_label', descKey: 'footer.dim1_desc', dim: 'dev' as const },
  { key: '02', labelKey: 'footer.dim2_label', descKey: 'footer.dim2_desc', dim: 'creative' as const },
  { key: '03', labelKey: 'footer.dim3_label', descKey: 'footer.dim3_desc', dim: 'maker' as const },
];

const Footer = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<FooterSettings>({});

  const navLinks = [
    { name: t('nav.home'), path: '/', key: '01' },
    { name: t('nav.about'), path: '/about', key: '02' },
    { name: t('nav.projects'), path: '/projects', key: '03' },
    { name: t('nav.education'), path: '/formations', key: '04' },
    { name: t('nav.experience'), path: '/experiences', key: '05' },
    { name: t('nav.contact'), path: '/contact', key: '06' },
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
    <footer className="relative border-t border-[rgb(var(--foreground-rgb))]/15 bg-[rgb(var(--background-start-rgb))] no-print">
      <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">

        {/* ── En-tête de colophon ── */}
        <div className="flex items-center gap-4 py-6 border-b border-[rgb(var(--foreground-rgb))]/10">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
            {t('footer.colophon')}
          </span>
          <span className="h-px flex-1 bg-[rgb(var(--foreground-rgb))]/10" />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 tabular-nums">
            {currentYear} — {t('footer.edition')} {locale?.toUpperCase()}
          </span>
        </div>

        {/* ── Grille principale ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-12 py-14">

          {/* Identité */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 bg-[var(--accent)]" />
              <span className="font-display text-3xl font-black leading-none tracking-[-0.06em]">
                {settings.siteTitle || 'MSK.'}
              </span>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-[rgb(var(--foreground-rgb))]/60 max-w-[38ch]">
              {t('footer.description')}
            </p>

            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="group mt-6 inline-flex items-center gap-2 min-h-[2.75rem] font-mono text-[13px] tracking-[0.02em] text-[rgb(var(--foreground-rgb))]/75 hover:text-[var(--accent-text)] dark:hover:text-[var(--accent)] transition-colors"
              >
                <span className="u-line">{settings.email}</span>
                <FiArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>

          {/* Navigation */}
          <nav className="lg:col-span-3" aria-label={t('footer.label')}>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 mb-5">
              {t('footer.navigation')}
            </p>
            <ul>
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="group flex items-baseline gap-3 py-2.5 border-b border-[rgb(var(--foreground-rgb))]/10"
                  >
                    <span className="font-mono text-[10px] tabular-nums text-[rgb(var(--foreground-rgb))]/60 group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent)] transition-colors">
                      {link.key}
                    </span>
                    <span className="text-[0.95rem] text-[rgb(var(--foreground-rgb))]/65 group-hover:text-[rgb(var(--foreground-rgb))] transition-colors">
                      {link.name}
                    </span>
                    <FiArrowUpRight className="ml-auto w-3.5 h-3.5 hover-reveal text-[rgb(var(--foreground-rgb))]/60 group-hover:text-[var(--accent)] dark:group-hover:text-[var(--accent)] group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Réseaux */}
          <div className="lg:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 mb-5">
              {t('footer.find_me')}
            </p>
            <ul>
              {socialLinks.map(item => (
                <li key={item.name}>
                  <a
                    href={item.href!}
                    target={item.name !== 'Email' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 py-2.5 border-b border-[rgb(var(--foreground-rgb))]/10 text-[rgb(var(--foreground-rgb))]/65 hover:text-[rgb(var(--foreground-rgb))] transition-colors"
                  >
                    <item.icon className="w-4 h-4 opacity-60" />
                    <span className="text-[0.95rem]">{item.name}</span>
                    <FiArrowUpRight className="ml-auto w-3.5 h-3.5 hover-reveal text-[rgb(var(--foreground-rgb))]/60 group-hover:text-[var(--accent)] dark:group-hover:text-[var(--accent)] group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bandeau des trois dimensions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-[rgb(var(--foreground-rgb))]/15">
          {dimensions.map((d, i) => (
            <div
              key={d.key}
              className={`py-7 sm:px-6 first:sm:pl-0 last:sm:pr-0 ${
                i > 0 ? 'sm:border-l border-t sm:border-t-0 border-[rgb(var(--foreground-rgb))]/10' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="font-mono text-[10px] tabular-nums text-[rgb(var(--foreground-rgb))]/65">{d.key}</span>
                <DimensionMark dim={d.dim} size={15} className="text-[rgb(var(--foreground-rgb))]/75" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]">
                  {t(d.labelKey)}
                </span>
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-[rgb(var(--foreground-rgb))]/60">
                {t(d.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* ── Signature typographique ── */}
        <div
          aria-hidden="true"
          className="group select-none overflow-hidden border-t border-[rgb(var(--foreground-rgb))]/15 pt-6"
        >
          {/* Taille volontairement contenue : c'est une signature, pas un titre.
              Au survol, l'URL du site se dévoile à côté — une découverte,
              jamais une information nécessaire. */}
          <span className="flex items-baseline gap-5 whitespace-nowrap">
            <span className="block font-display font-black leading-[0.9] tracking-[-0.06em] text-[clamp(1.75rem,5vw,4rem)] text-[rgb(var(--foreground-rgb))]/[0.07] transition-colors duration-700 group-hover:text-[rgb(var(--foreground-rgb))]/[0.15]">
              MSK®
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/70 opacity-0 -translate-x-3 transition-all duration-500 ease-out-expo group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none">
              mehmetsalihk.fr
            </span>
          </span>
        </div>

        {/* ── Barre inférieure ── */}
        <div className="py-6 border-t border-[rgb(var(--foreground-rgb))]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-[0.04em] text-[rgb(var(--foreground-rgb))]/60">
            © {currentYear} {settings.siteTitle || 'MSK.'} — {t('footer.rights')}
          </p>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-[rgb(var(--foreground-rgb))]/60">
            <FiCode className="w-3.5 h-3.5" />
            Next.js · TypeScript · MongoDB
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
