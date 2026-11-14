import { ReactNode } from 'react';
import { Reveal, DrawRule } from '@/components/motion/Reveal';

interface SectionHeadProps {
  index?: string;
  kicker: string;
  title: ReactNode;
  desc?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Identifiant dessiné du système « CALQUE » (Marks.tsx) */
  sigil?: ReactNode;
}

/**
 * En-tête standard des sections : sigil, index, libellé, titre display, chapeau.
 * Le titre accepte du JSX pour l'accent serif italique.
 */
export default function SectionHead({ index, kicker, title, desc, action, className = '', sigil }: SectionHeadProps) {
  return (
    <div className={className}>
      <DrawRule className="mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-5 items-end">
        <div className="lg:col-span-8">
          <Reveal delay={0.05}>
            <div className="flex items-center gap-4 mb-5">
              {sigil && (
                <span className="flex -ml-0.5 text-[rgb(var(--foreground-rgb))]/75">{sigil}</span>
              )}
              {index && <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)]">{index}</span>}
              <span className="kicker kicker--plain">{kicker}</span>
            </div>
          </Reveal>
          <Reveal delay={0.1} y={30}>
            <h2 className="text-balance">{title}</h2>
          </Reveal>
        </div>

        {(desc || action) && (
          <div className="lg:col-span-4 lg:pb-2">
            <Reveal delay={0.18}>
              {desc && <p className="section-desc">{desc}</p>}
              {action && <div className="mt-5">{action}</div>}
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}
