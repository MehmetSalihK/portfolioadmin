import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiMail } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';

/**
 * Page de maintenance — direction TRACÉ : masthead mono, titre display,
 * filets 1px, vermillon. Aucune orbe, aucun blur, aucun coin arrondi.
 */
export default function Maintenance() {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[rgb(var(--background-start-rgb))] text-[rgb(var(--foreground-rgb))] flex flex-col">
      <Head>
        <title>{`${t('maintenance.kicker')} — MSK`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#efeae1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] flex-1 flex flex-col justify-center py-20">
        {/* ── Ligne de métadonnées ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-12 border-b border-[rgb(var(--foreground-rgb))]/15"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
            MSK — {t('maintenance.kicker')}
          </span>
          <span className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
            <motion.span
              className="w-1.5 h-1.5 bg-[var(--accent)]"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {t('maintenance.status')}
          </span>
        </motion.div>

        {/* ── Titre display ── */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-black text-[clamp(2.6rem,7.5vw,6.5rem)] leading-[0.9] tracking-[-0.05em] m-0 text-balance max-w-[16ch]"
        >
          {t('maintenance.title_part1')}{' '}
          <span className="font-accent text-[1.1em] text-[var(--accent-text)] dark:text-[var(--accent)]">
            {t('maintenance.title_part2')}
          </span>
          <span className="text-[var(--accent-text)] dark:text-[var(--accent)]">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="lead max-w-[46ch] mt-9 mb-0"
        >
          {t('maintenance.description')}
        </motion.p>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-stretch gap-3 mt-10"
        >
          <a href="mailto:contact@mehmetsalihk.fr" className="btn btn-primary">
            <FiMail className="w-4 h-4" />
            {t('maintenance.cta')}
            <FiArrowUpRight className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/mehmetsalihk"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            GitHub
            <FiArrowUpRight className="w-4 h-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/mehmetsalihk/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            LinkedIn
            <FiArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* ── Filet de fin ── */}
        <div className="mt-16 pt-6 border-t border-[rgb(var(--foreground-rgb))]/15 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]/60 tabular-nums">
            © {currentYear} MSK — {t('footer.rights')}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--foreground-rgb))]/60">
            {locale?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fr', ['common'])),
  },
});
