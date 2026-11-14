import { ReactNode } from 'react';

/**
 * Système de marques « CALQUE » — grammaire commune :
 *  - grille 24×24, tracé 1.5, extrémités et jointures carrées (radius 0) ;
 *  - géométrie en encre (currentColor), UN nœud vermillon 3×3 par marque ;
 *  - aucun dégradé, aucun arrondi, aucune icône de bibliothèque.
 *
 * Trois dimensions → trois silhouettes distinctes, lisibles à 16 px :
 *  - Developer  : trois barres (l'index, le curseur en fin de ligne)
 *  - Creative  : quatre équerres (le viseur, le sujet au centre)
 *  - Maker     : carré fermé + traits de calage (la centrage d'établi)
 */

export type Dimension = 'dev' | 'creative' | 'maker';
export type SectionGlyph = 'univers' | 'projects' | 'skills' | 'experience' | 'contact';

interface MarkProps {
  size?: number;
  className?: string;
}

function Plate({ children, size = 22, className = '' }: MarkProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={`block shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

const node = (x: number, y: number) => (
  <rect x={x} y={y} width={3} height={3} fill="var(--accent)" stroke="none" />
);

/* ════════════ Dimensions ════════════ */

/** Developer — l'index : trois barres, le nœud clôt la dernière. */
export function DimensionMark({ dim, size = 22, className = '' }: MarkProps & { dim: Dimension }) {
  if (dim === 'dev') {
    return (
      <Plate size={size} className={className}>
        <path d="M4 6.5h11M4 12h15M4 17.5h8" />
        {node(15.5, 16)}
      </Plate>
    );
  }
  if (dim === 'creative') {
    return (
      <Plate size={size} className={className}>
        <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
        {node(10.5, 10.5)}
      </Plate>
    );
  }
  /* Maker — le carré de calage, ses quatre traits, le point de centre */
  return (
    <Plate size={size} className={className}>
      <rect x={4.75} y={4.75} width={14.5} height={14.5} />
      <path d="M12 1.75v3M12 19.25v3M1.75 12h3M19.25 12h3" />
      {node(10.5, 10.5)}
    </Plate>
  );
}

/** Les trois dimensions en rangée — le triptyque de la marque. */
export function Triad({ size = 22, className = '' }: MarkProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-hidden="true">
      <DimensionMark dim="dev" size={size} />
      <DimensionMark dim="creative" size={size} />
      <DimensionMark dim="maker" size={size} />
    </span>
  );
}

/* ════════════ Identifiants de section ════════════ */

export function SectionMark({ name, size = 20, className = '' }: MarkProps & { name: SectionGlyph }) {
  switch (name) {
    case 'univers':
      /* Le triptyque : trois montants, le nœud coiffe le central */
      return (
        <Plate size={size} className={className}>
          <path d="M5 20v-8M12 20V6M19 20v-5" />
          {node(10.5, 3)}
        </Plate>
      );
    case 'projects':
      /* La planche de contact : quatre cellules, l'une est exposée */
      return (
        <Plate size={size} className={className}>
          <rect x={4} y={4} width={16} height={16} />
          <path d="M4 12h16M12 4v16" />
          {node(12.5, 12.5)}
        </Plate>
      );
    case 'skills':
      /* Le relevé : règle en tête, montants descendants, le nœud au pied */
      return (
        <Plate size={size} className={className}>
          <path d="M4 6h16M7 6v8M12 6v4M17 6v11" />
          {node(15.5, 17)}
        </Plate>
      );
    case 'experience':
      /* Le trajet : deux jalons, le nœud entre eux */
      return (
        <Plate size={size} className={className}>
          <path d="M3 12h6M15 12h6M9 8v8M15 8v8" />
          {node(10.5, 10.5)}
        </Plate>
      );
    case 'contact':
    default:
      /* La correspondance : la feuille pliée, le cachet */
      return (
        <Plate size={size} className={className}>
          <path d="M4 3h10l6 6v12H4z" />
          <path d="M14 3v6h6" />
          {node(6.5, 13)}
        </Plate>
      );
  }
}

/* ════════════ Marque de site ════════════ */

/**
 * Marque MSK : la fenêtre de projection et sa bande de données,
 * la cellule marquée en vermillon. Sert de logo dessiné (navbar, pied, ardoise).
 */
export function BrandMark({ size = 20, className = '' }: MarkProps) {
  return (
    <Plate size={size} className={className}>
      <rect x={3} y={5} width={18} height={14} />
      <path d="M3 15h18" />
      <rect x={5} y={15} width={3} height={3} fill="var(--accent)" stroke="none" />
    </Plate>
  );
}

/**
 * Repères de coupe : deux équerres vermillon posées hors cadre
 * (haut-gauche / bas-droite). Le parent doit être `relative` et SANS
 * overflow-hidden — placer le repère en frère du cadre image.
 */
export function CropMarks({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`crop-marks ${className}`} />;
}
