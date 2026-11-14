import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next/pages';

/**
 * Repères cachés — trois découvertes optionnelles, toutes décoratives :
 *  1. La touche « G » pose la grille de repérage 24 × 24 (Échap la referme) ;
 *  2. Le colophon console, pour ceux qui ouvrent l'outillage ;
 *  3. « ?slate=1 » rejoue l'ardoise d'ouverture (voir OpeningSlate).
 * Aucune information importante n'est cachée là : si l'utilisateur ne
 * tape jamais « G », il ne perd rien — la grille ne remplace rien.
 */
export default function EasterEggs() {
  const { t } = useTranslation('common');
  const [grid, setGrid] = useState(false);

  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node || !node.tagName) return false;
      const tag = node.tagName.toUpperCase();
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable === true;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping(e.target)) return;
      if (e.key === 'g' || e.key === 'G') {
        setGrid((v) => !v);
      } else if (e.key === 'Escape') {
        setGrid(false);
      }
    };
    window.addEventListener('keydown', onKey);

    /* Colophon : une seule fois, silencieux, sans réseau ni calcul */
    try {
      console.info(
        '%cMSK · CALQUE',
        'background:#ff4a17;color:#14130f;font-family:monospace;font-size:11px;letter-spacing:.18em;padding:2px 6px',
        `\n${t('egg.console')}`
      );
    } catch {
      /* console indisponible (useSecurity peut la neutraliser) */
    }

    return () => window.removeEventListener('keydown', onKey);
  }, [t]);

  if (!grid) return null;

  return (
    <div className="calque-grid" aria-hidden="true">
      <span className="calque-grid__readout calque-grid__readout--tl">24 × 24</span>
      <span className="calque-grid__readout calque-grid__readout--br">G</span>
    </div>
  );
}
