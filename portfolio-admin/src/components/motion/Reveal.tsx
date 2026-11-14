import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Révélation universelle : montée douce + fondu.
 *
 * `initial` est volontairement inconditionnel : il doit produire exactement le
 * même style serveur que client, sinon React signale une divergence
 * d'hydratation. La prise en charge de `prefers-reduced-motion` est déléguée à
 * `<MotionConfig reducedMotion="user">` (voir Layout.tsx), qui neutralise les
 * translations mais laisse passer les fondus.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 0.7,
  className,
  amount = 0.2,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ delay, duration, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Révélation ligne par ligne — chaque enfant monte depuis un masque.
 * Les lignes doivent être des éléments bloquants (span/div avec .reveal-line).
 */
export function RevealLines({
  children,
  delay = 0,
  stagger = 0.09,
  className,
}: {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  /* `yPercent` est supporté à l'exécution mais absent du `CSSProperties`
     résolu par cette version de framer-motion : on garde un typage permissif. */
  /* Masque : 0.14em sous la ligne pour laisser passer les jambages
     (« p », « y », « g » à leading 0.9), compensé par une marge négative
     pour ne pas desserrer l'interlignage. yPercent 125 garantit que le
     contenu reste hors du masque pendant l'état « hidden ». */
  const item: Record<string, any> = {
    hidden: { opacity: 0, yPercent: 125 },
    show: { opacity: 1, yPercent: 0, transition: { duration: 0.9, ease: EASE } },
  };
  return (
    <motion.span className={`block ${className || ''}`} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <span key={i} className="reveal-line" style={{ paddingBottom: '0.14em', marginBottom: '-0.06em' }}>
              <motion.span className="block" variants={item}>{child}</motion.span>
            </span>
          ))
        : <span className="reveal-line" style={{ paddingBottom: '0.14em', marginBottom: '-0.06em' }}><motion.span className="block" variants={item}>{children}</motion.span></span>}
    </motion.span>
  );
}

/**
 * Révélation mot à mot — chaque mot monte depuis son propre masque.
 * Les segments permettent de conserver la ponctuation collée au mot
 * (glue: 'none') et les accents serif italiques (className).
 */
export function RevealWords({
  segments,
  delay = 0,
  stagger = 0.045,
  className,
}: {
  segments: Array<{ text: string; className?: string; glue?: 'space' | 'none' }>;
  delay?: number;
  stagger?: number;
  className?: string;
}) {
  /* Aplatit en mots, en gardant la classe de segment et le rattachage */
  const words: Array<{ w: string; cls?: string; glued: boolean }> = [];
  segments.forEach((seg) => {
    seg.text
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w, i) => {
        words.push({ w, cls: seg.className, glued: i > 0 ? true : seg.glue === 'none' ? false : words.length > 0 });
      });
  });

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const item: Record<string, any> = {
    hidden: { opacity: 0, yPercent: 115 },
    show: { opacity: 1, yPercent: 0, transition: { duration: 0.85, ease: EASE } },
  };

  return (
    <motion.span
      className={`block ${className || ''}`}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: '0.14em', marginBottom: '-0.08em' }}
        >
          {word.glued ? <span>&nbsp;</span> : null}
          <motion.span className={`inline-block ${word.cls || ''}`} variants={item}>
            {word.w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Filet qui se trace de la gauche vers la droite. */
export function DrawRule({ className = '', delay = 0, accent = false }: { className?: string; delay?: number; accent?: boolean }) {
  return (
    <motion.div
      className={`h-px w-full origin-left ${accent ? 'bg-[var(--accent)]' : 'bg-[rgb(var(--foreground-rgb))]/15'} ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 1.1, ease: EASE }}
    />
  );
}

/** Compteur d'indices : 01 — 04 */
export function Counter({ value, className = '' }: { value: string; className?: string }) {
  return <span className={`index-num ${className}`}>{value}</span>;
}
