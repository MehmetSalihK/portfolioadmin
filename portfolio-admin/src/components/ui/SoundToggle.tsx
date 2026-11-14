import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { useTranslation } from 'next-i18next/pages';
import { initSound, isSoundEnabled, setSoundEnabled, playSfx } from '@/utils/sound';

/**
 * Commande son : visible, carrée, 44 px, aria-pressed.
 * État par défaut : coupé. La préférence est mémorisée localement.
 */
export default function SoundToggle({ className = '' }: { className?: string }) {
  const { t } = useTranslation('common');
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(initSound());
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) playSfx('tick'); /* confirmation audible du retour à l'état activé */
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? t('sound.off') : t('sound.on')}
      title={enabled ? t('sound.off') : t('sound.on')}
      className={`relative w-11 h-11 flex items-center justify-center transition-colors duration-300 ${
        enabled
          ? 'text-[var(--accent-text)] dark:text-[var(--accent)]'
          : 'text-[rgb(var(--foreground-rgb))]/60 hover:text-[rgb(var(--foreground-rgb))]'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={enabled ? 'on' : 'off'}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          {enabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
