import { createSharedPathnamesNavigation } from 'next-intl/navigation';
 
export const locales = ['en', 'fr', 'tr'] as const;
export const defaultLocale = 'en' as const;
 
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
