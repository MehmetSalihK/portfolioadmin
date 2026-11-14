import type React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';
import { getLocalized } from '@/utils/i18n-utils';
import SectionHead from '@/components/ui/SectionHead';
import { SectionMark } from '@/components/identity/Marks';
import { EASE } from '@/components/motion/Reveal';

interface SkillCategory {
  _id: string;
  name: string;
  displayOrder: number;
  skills: Array<{ _id: string; name: string; categoryId: { name: string; _id: string }; displayOrder: number }>;
}

export default function SkillsSection({ skillsByCategory = [] }: { skillsByCategory?: SkillCategory[] }) {
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  const categories = skillsByCategory.filter(c => c.skills && c.skills.length > 0);
  const total = categories.reduce((sum, c) => sum + c.skills.length, 0);

  return (
    <section id="skills" className="relative">
      <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] py-[var(--section-gap)]">
        <SectionHead
          index="03"
          kicker={t('skills.subtitle')}
          sigil={<SectionMark name="skills" />}
          title={t('skills.title')}
          desc={t('skills.description')}
          action={
            <span className="index-num">
              {String(total).padStart(2, '0')} {t('skills.entries')}
            </span>
          }
        />

        {categories.length === 0 ? (
          <p className="mt-14 font-mono text-[12px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/60">
            — {t('skills.empty')}
          </p>
        ) : (
          <div className="mt-12 border-t border-[rgb(var(--foreground-rgb))]/15">
            {/* Mobile : index · nom · compteur sur une ligne de spécimen,
                liste des compétences en dessous (fini le chiffre orphelin) */}
            {categories.map((category, ci) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: Math.min(ci * 0.05, 0.3), ease: EASE }}
                className="group grid grid-cols-[auto_1fr_auto] lg:grid-cols-12 gap-x-4 lg:gap-x-[var(--gutter)] gap-y-3 py-6 lg:py-7 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-500 ease-out-expo px-2 -mx-2"
              >
                {/* Index */}
                <div className="lg:col-span-1 flex items-center gap-3">
                  <span className="index-num text-[var(--accent-text)] dark:text-[var(--accent)] tabular-nums">
                    {String(ci + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Catégorie */}
                <div className="lg:col-span-3 flex items-center lg:block">
                  <h3 className="text-[1.15rem] font-bold leading-tight tracking-[-0.02em] m-0">
                    {getLocalized(category, 'name', locale) || category.name}
                  </h3>
                </div>

                {/* Compétences — liste continue, pas de badges */}
                <ul className="col-span-3 row-start-2 lg:col-span-7 lg:row-start-auto flex flex-wrap items-baseline gap-x-5 gap-y-2 m-0 p-0 list-none">
                  {category.skills.map((skill) => (
                    <li key={skill._id || skill.name} className="relative">
                      <span className="text-[0.95rem] text-[rgb(var(--foreground-rgb))]/70 group-hover:text-[rgb(var(--foreground-rgb))] transition-colors duration-300">
                        {skill.name}
                      </span>
                      <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </li>
                  ))}
                </ul>

                {/* Compteur */}
                <div className="lg:col-span-1 flex items-center lg:block lg:text-right">
                  <span className="index-num tabular-nums">
                    {String(category.skills.length).padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
