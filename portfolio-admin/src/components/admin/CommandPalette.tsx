import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import {
    FiHome, FiFolder, FiCode, FiBriefcase, FiBookOpen, FiImage,
    FiBarChart2, FiShield, FiMail, FiSettings, FiLogOut, FiSun, FiMoon,
    FiSearch
} from 'react-icons/fi';

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
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
            <Command
                className="w-full max-w-lg bg-white dark:bg-[#1E2533] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                loop
            >
                <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                    <FiSearch className="w-5 h-5 text-gray-500 mr-3" />
                    <Command.Input
                        autoFocus
                        placeholder="Rechercher une action..."
                        className="w-full py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
                    />
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto py-2 px-2 custom-scrollbar">
                    <Command.Empty className="py-6 text-center text-gray-500 text-sm">
                        Aucun résultat trouvé.
                    </Command.Empty>

                    <Command.Group heading="Navigation" className="text-xs font-medium text-gray-400 mb-2 px-2 uppercase tracking-wider">
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiHome className="w-4 h-4 mr-3" />
                            Overview
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/projects'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiFolder className="w-4 h-4 mr-3" />
                            Projets
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/skills'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiCode className="w-4 h-4 mr-3" />
                            Compétences
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/experience'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiBriefcase className="w-4 h-4 mr-3" />
                            Expériences
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/education'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiBookOpen className="w-4 h-4 mr-3" />
                            Formation
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/media'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiImage className="w-4 h-4 mr-3" />
                            Médias
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Système" className="text-xs font-medium text-gray-400 mb-2 mt-4 px-2 uppercase tracking-wider">
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/backup'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiShield className="w-4 h-4 mr-3" />
                            Sauvegardes
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/analytics'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiBarChart2 className="w-4 h-4 mr-3" />
                            Analytics
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/admin/settings'))}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            <FiSettings className="w-4 h-4 mr-3" />
                            Paramètres
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => toggleTheme())}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400"
                        >
                            {theme === 'dark' ? <FiSun className="w-4 h-4 mr-3" /> : <FiMoon className="w-4 h-4 mr-3" />}
                            {theme === 'dark' ? 'Mode Chair' : 'Mode Sombre'}
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => signOut({ callbackUrl: '/admin/login' }))}
                            className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg cursor-pointer aria-selected:bg-red-500/10"
                        >
                            <FiLogOut className="w-4 h-4 mr-3" />
                            Déconnexion
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex justify-end">
                    <span className="text-xs text-gray-400 px-2">Portfolio Admin Command Palette</span>
                </div>
            </Command>
        </div>
    );
}
