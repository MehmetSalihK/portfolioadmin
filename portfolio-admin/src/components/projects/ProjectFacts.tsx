import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';
import { formatMonthYear } from '@/utils/project-display';

export interface GithubFacts {
  language?: string | null;
  stars?: number;
  forks?: number;
  lastUpdated?: string | Date | null;
}

interface Props {
  githubData?: GithubFacts | null;
  className?: string;
}

/**
 * Relevé GitHub d'un projet (case study) : dernière mise à jour, étoiles,
 * fourches. N'affiche que les données réellement disponibles — jamais de
 * ligne vide, jamais de chiffre inventé.
 */
export default function ProjectFacts({ githubData, className = '' }: Props) {
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  if (!githubData) return null;

  const rows: Array<[string, string]> = [];
  const updated = formatMonthYear(githubData.lastUpdated, locale);
  if (updated) rows.push([t('projects.updated_label'), updated]);
  if (githubData.stars && githubData.stars > 0) rows.push([t('projects.stars_label'), String(githubData.stars)]);
  if (githubData.forks && githubData.forks > 0) rows.push([t('projects.forks_label'), String(githubData.forks)]);

  if (rows.length === 0) return null;

  return (
    <dl className={`m-0 font-mono text-[11px] ${className}`}>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-4 py-2 border-b border-[rgb(var(--foreground-rgb))]/10"
        >
          <dt className="uppercase tracking-[0.14em] text-[rgb(var(--foreground-rgb))]/60">{label}</dt>
          <dd className="m-0 tabular-nums text-[rgb(var(--foreground-rgb))]/80">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
