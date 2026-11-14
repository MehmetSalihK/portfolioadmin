import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';

/* Rail de pellicule : le bord de la bande, ses perforations, sa position
   dans le bobine. Décoratif (aria-hidden), jamais interactif. */

const routeInfo: Record<string, { idx: string; nav: string }> = {
  '/': { idx: '01', nav: 'home' },
  '/about': { idx: '02', nav: 'about' },
  '/projects': { idx: '03', nav: 'projects' },
  '/formations': { idx: '04', nav: 'education' },
  '/experiences': { idx: '05', nav: 'experience' },
  '/contact': { idx: '06', nav: 'contact' },
  '/developpeur': { idx: '01', nav: 'developer' },
  '/designer': { idx: '02', nav: 'creative' },
  '/maker': { idx: '03', nav: 'maker' },
};

export default function FilmRail() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [pct, setPct] = useState(0);

  const info = routeInfo[router.pathname];

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      const p = max > 8 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setPct((prev) => {
        const next = Math.round(p * 100);
        return next === prev ? prev : next;
      });
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  if (!info) return null;

  return (
    <aside
      aria-hidden="true"
      className="hidden xl:flex pointer-events-none select-none fixed left-1.5 top-[4.5rem] bottom-0 w-12 z-40 flex-col items-center py-7"
    >
      <span className="font-mono text-[10px] font-medium tracking-[0.14em] tabular-nums text-[rgb(var(--foreground-rgb))]/65">
        {info.idx}
      </span>

      {/* La bande : filet central, perforations, repère vermillon */}
      <div className="relative flex-1 my-5 w-4">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[rgb(var(--foreground-rgb))]/20" />
        <span className="absolute inset-y-0 left-0 right-0 film-ticks" />
        <span
          className="absolute left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)]"
          style={{ top: `${pct}%` }}
        />
      </div>

      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--foreground-rgb))]/65 [writing-mode:vertical-rl]">
        {t(`nav.${info.nav}`)}
      </span>

      <span className="mt-4 font-mono text-[10px] tabular-nums text-[rgb(var(--foreground-rgb))]/65">
        {String(pct).padStart(3, '0')}
      </span>
    </aside>
  );
}
