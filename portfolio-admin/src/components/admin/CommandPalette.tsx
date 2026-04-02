import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import {
    FiHome, FiFolder, FiCode, FiBriefcase, FiBookOpen, FiImage,
    FiBarChart2, FiShield, FiMail, FiSettings, FiLogOut, FiSun, FiMoon,
    FiSearch, FiActivity, FiTerminal, FiZap, FiCommand, FiGrid, FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/40 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4 font-jakarta animate-in fade-in duration-300">
            <div className="absolute inset-0 z-0" onClick={() => setOpen(false)} />
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
                <Command
                    className="w-full bg-white/90 dark:bg-[#0d0d12]/90 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border dark:border-white/5 border-slate-200 overflow-hidden"
                    loop
                >
                    <div className="flex items-center px-8 border-b dark:border-white/5 border-slate-100">
                        <FiSearch className="text-primary-500 w-5 h-5 mr-4" />
                        <Command.Input
                            autoFocus
                            placeholder="REQUÊTE SYSTÈME…"
                            className="w-full py-7 bg-transparent outline-none dark:text-white text-slate-900 placeholder-slate-400 font-black text-xs uppercase tracking-[0.2em]"
                        />
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border dark:border-white/5 border-slate-200 opacity-40">
                           <span className="text-[9px] font-black uppercase">ESC</span>
                        </div>
                    </div>

                    <Command.List className="max-h-[450px] overflow-y-auto py-6 px-4 space-y-4 scrollbar-hide">
                        <Command.Empty className="py-20 text-center flex flex-col items-center gap-4">
                           <div className="w-16 h-16 bg-slate-50 dark:bg-white/[0.02] rounded-2xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200 dark:border-white/5"><FiActivity size={32} /></div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucun module correspondant trouvé.</p>
                        </Command.Empty>

                        <Command.Group heading="Navigation Gateway" className="text-[9px] font-black text-primary-500/50 mb-3 px-4 uppercase tracking-[0.4em]">
                            {[
                               { l: 'Dashboard HQ', h: '/admin', i: FiGrid },
                               { l: 'Projets Node', h: '/admin/projects', i: FiFolder },
                               { l: 'Skills Architecture', h: '/admin/skills', i: FiCode },
                               { l: 'Expériences Log', h: '/admin/experience', i: FiBriefcase },
                               { l: 'Formation Data', h: '/admin/education', i: FiBookOpen },
                               { l: 'Media Manager', h: '/admin/media', i: FiImage },
                            ].map(item => (
                               <Command.Item
                                   key={item.h}
                                   onSelect={() => runCommand(() => router.push(item.h))}
                                   className="flex items-center gap-4 px-4 py-3 dark:text-slate-200 text-slate-700 rounded-2xl cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white transition-all group font-black text-[11px] uppercase tracking-widest"
                               >
                                   <item.i className="w-4 h-4" />
                                   {item.l}
                                   <FiChevronRight className="ml-auto opacity-30 group-aria-selected:opacity-60 transition-opacity" />
                               </Command.Item>
                            ))}
                        </Command.Group>

                        <Command.Group heading="Commandes Système" className="text-[9px] font-black text-indigo-500/50 mb-3 px-4 mt-8 uppercase tracking-[0.4em]">
                            {[
                               { l: 'Archives & Backups', h: '/admin/backup', i: FiShield },
                               { l: 'Analytics Stream', h: '/admin/analytics', i: FiBarChart2 },
                               { l: 'Core Settings', h: '/admin/settings', i: FiSettings },
                            ].map(item => (
                               <Command.Item
                                   key={item.h}
                                   onSelect={() => runCommand(() => router.push(item.h))}
                                   className="flex items-center gap-4 px-4 py-3 dark:text-slate-200 text-slate-700 rounded-2xl cursor-pointer aria-selected:bg-indigo-500 aria-selected:text-white transition-all group font-black text-[11px] uppercase tracking-widest"
                               >
                                   <item.i className="w-4 h-4" />
                                   {item.l}
                                   <FiChevronRight className="ml-auto opacity-30 group-aria-selected:opacity-60 transition-opacity" />
                               </Command.Item>
                            ))}
                            <Command.Item
                                onSelect={() => runCommand(() => toggleTheme())}
                                className="flex items-center gap-4 px-4 py-3 dark:text-slate-200 text-slate-700 rounded-2xl cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white transition-all group font-black text-[11px] uppercase tracking-widest"
                            >
                                {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                                {theme === 'dark' ? 'Basculer Mode Clair' : 'Basculer Mode Sombre'}
                                <span className="ml-auto text-[8px] opacity-40 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">THEME_SYNC</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => signOut({ callbackUrl: '/admin/login' }))}
                                className="flex items-center gap-4 px-4 py-3 text-rose-500 rounded-2xl cursor-pointer aria-selected:bg-rose-500 aria-selected:text-white transition-all group font-black text-[11px] uppercase tracking-widest"
                            >
                                <FiLogOut className="w-4 h-4" />
                                Fin de Session
                                <span className="ml-auto text-[8px] opacity-40 bg-rose-500/10 dark:bg-rose-500/10 px-2 py-0.5 rounded-md group-aria-selected:bg-white/10 group-aria-selected:text-white">EXIT</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>

                    <div className="border-t dark:border-white/5 border-slate-100 p-5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                           <FiTerminal className="text-primary-500" size={14} />
                           <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">MSK ADMIN PERSPECTIVE v2.2</span>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex items-center gap-1 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                              <FiZap /> Optimized
                           </div>
                           <div className="flex items-center gap-1 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                              <FiActivity /> Live
                           </div>
                        </div>
                    </div>
                </Command>
            </motion.div>
        </div>
    );
}
