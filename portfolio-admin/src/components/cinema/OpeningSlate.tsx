import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next/pages';
import { EASE } from '@/components/motion/Reveal';
import { BrandMark } from '@/components/identity/Marks';

const STORAGE_KEY = 'msk.slate';

/**
 * Ardoise d'ouverture — la « planche de départ » du film :
 * une seule fois par session, ~1,9 s, sautable au moindre geste,
 * jamais affichée sous prefers-reduced-motion, jamais bloquante
 * (le contenu est déjà rendu dessous ; l'élément est aria-hidden).
 */
export default function OpeningSlate() {
  const { t } = useTranslation('common');
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const seen = useRef(false);

  /* Décision d'ouverture — prise une seule fois, après hydratation */
  useEffect(() => {
    /* Jamais sur une page d'erreur (atterrir sur un 404 « filmé » agace) ;
       `__NEXT_DATA__.page` est fiable côté client, y compris sur route inconnue */
    try {
      if ((window as any).__NEXT_DATA__?.page === '/404') return;
    } catch {
      /* ignore */
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* « ?slate=1 » : rejoue l'ardoise même déjà vue (découverte cachée) */
    const replay = new URLSearchParams(window.location.search).has('slate');
    try {
      if (!replay && sessionStorage.getItem(STORAGE_KEY) === '1') return;
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* stockage indisponible : on joue quand même, une fois par montée */
    }
    seen.current = true;
    const id = window.setTimeout(() => setPhase('in'), 60);
    return () => window.clearTimeout(id);
  }, []);

  /* Refermeture automatique */
  useEffect(() => {
    if (phase !== 'in') return;
    const id = window.setTimeout(() => setPhase('out'), 1250);
    return () => window.clearTimeout(id);
  }, [phase]);

  /* Saut : le premier geste (clé, clic, molette, tactile) efface l'ardoise */
  useEffect(() => {
    if (phase !== 'in') return;
    const skip = () => setPhase('out');
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchstart', skip, { passive: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
    };
  }, [phase]);

  if (!seen.current && phase === 'idle') return null;

  return (
    <AnimatePresence onExitComplete={() => setPhase('idle')}>
      {/* Rendu seulement en phase 'in' : le passage à 'out' démontre
          l'enfant, ce qui déclenche réellement l'animation `exit` */}
      {phase === 'in' && (
        <motion.div
          key="slate"
          aria-hidden="true"
          className="fixed inset-0 z-[200] grain bg-[rgb(var(--background-start-rgb))] flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ y: '-101%', transition: { duration: 0.7, ease: EASE } }}
          transition={{ duration: 0.35, ease: 'linear' }}
        >
          <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-center gap-4 mb-7"
            >
              <BrandMark size={26} className="text-[rgb(var(--foreground-rgb))]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
                MSK
              </span>
            </motion.div>

            {/* Le filet vermillon se trace : l'exposition commence */}
            <motion.div
              aria-hidden="true"
              className="h-px w-full bg-[var(--accent)] origin-left mb-7"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.1 }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className="font-display font-black text-[clamp(1.6rem,4vw,3rem)] leading-none tracking-[-0.05em] m-0 max-w-[24ch]"
            >
              {t('footer.description')}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
