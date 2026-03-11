import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
import { FiSearch, FiSave, FiEdit2, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SEOData {
    _id?: string;
    page: string;
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    updatedAt?: string;
}

const DEFAULT_PAGES = ['home', 'projects', 'about', 'contact', 'blog'];

export default function SEOPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [seoList, setSeoList] = useState<SEOData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeo, setEditingSeo] = useState<SEOData>({
        page: '',
        title: '',
        description: '',
        keywords: []
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login');
        } else if (status === 'authenticated') {
            fetchSEOData();
        }
    }, [status, router]);

    const fetchSEOData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/seo');
            if (res.ok) {
                const data = await res.json();
                const mergedData = DEFAULT_PAGES.map(page => {
                    const existing = data.find((d: SEOData) => d.page === page);
                    return existing || { page, title: '', description: '', keywords: [] };
                });
                setSeoList(mergedData);
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des données SEO');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (seo: SEOData) => {
        setEditingSeo({
            ...seo,
            keywords: Array.isArray(seo.keywords) ? seo.keywords : []
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/seo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSeo)
            });

            if (res.ok) {
                toast.success('SEO mis à jour avec succès');
                setIsModalOpen(false);
                fetchSEOData();
            } else {
                toast.error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            toast.error('Erreur serveur');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                            <span className="w-8 h-[1px] bg-primary"></span>
                            Performance
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                            SEO
                            <span className="text-zinc-700 text-lg font-medium tabular-nums bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                {seoList.length}
                            </span>
                        </h1>
                        <p className="text-zinc-500 mt-2 font-medium">
                            Optimisez la visibilité de vos pages sur les moteurs de recherche.
                        </p>
                    </div>
                </motion.div>

                {/* SEO Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seoList.map((seo, index) => (
                        <motion.div
                            key={seo.page}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-background-card border border-border-subtle rounded-3xl p-6 hover:border-indigo-500/30 transition-all duration-500"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                                        <FiGlobe className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white capitalize tracking-tight group-hover:text-indigo-400 transition-colors">
                                            {seo.page}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`w-1.5 h-1.5 rounded-full ${seo.title ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                {seo.title ? 'Configuré' : 'Incomplet'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleEdit(seo)}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Méta Titre</p>
                                    <p className="text-sm text-zinc-300 font-medium truncate">
                                        {seo.title || 'Non défini'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Méta Description</p>
                                    <p className="text-sm text-zinc-400 font-medium line-clamp-2 leading-relaxed italic">
                                        {seo.description || 'Aucune description configurée...'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`SEO Configuration : ${editingSeo.page}`}
                >
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                Titre de la page (SEO Title)
                            </label>
                            <input
                                type="text"
                                value={editingSeo.title}
                                onChange={(e) => setEditingSeo({ ...editingSeo, title: e.target.value })}
                                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-white/10 placeholder-zinc-600 transition-all"
                                placeholder="Ex: Accueil - Développeur Fullstack"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                Méta Description
                            </label>
                            <textarea
                                value={editingSeo.description}
                                onChange={(e) => setEditingSeo({ ...editingSeo, description: e.target.value })}
                                rows={4}
                                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-white/10 placeholder-zinc-600 transition-all resize-none"
                                placeholder="Description courte pour Google..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                Mots-clés (Keywords)
                            </label>
                            <input
                                type="text"
                                value={editingSeo.keywords.join(', ')}
                                onChange={(e) => setEditingSeo({
                                    ...editingSeo,
                                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                                })}
                                className="w-full bg-white/5 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-white/10 placeholder-zinc-600 transition-all"
                                placeholder="react, nextjs, portfolio..."
                            />
                            <p className="text-[10px] text-zinc-500 mt-2 italic">* Séparez les mots-clés par des virgules.</p>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 border border-indigo-500"
                            >
                                <FiSave className="w-4 h-4" />
                                Mettre à jour
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
