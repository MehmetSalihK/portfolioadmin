import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import Modal from '@/components/admin/Modal';
import { FiSearch, FiSave, FiEdit2, FiGlobe } from 'react-icons/fi';
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
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            SEO Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Gérez les méta-tags pour optimiser le référencement de vos pages
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seoList.map((seo) => (
                        <div
                            key={seo.page}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                                            <FiGlobe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                                                {seo.page}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${seo.title ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {seo.title ? 'Configuré' : 'Non configuré'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(seo)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-primary-500"
                                    >
                                        <FiEdit2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Titre</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-300 truncate">
                                            {seo.title || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Description</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-300 line-clamp-2">
                                            {seo.description || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Modifier SEO : ${editingSeo.page}`}
                >
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Titre de la page
                            </label>
                            <input
                                type="text"
                                value={editingSeo.title}
                                onChange={(e) => setEditingSeo({ ...editingSeo, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Ex: Accueil - Mon Portfolio"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description Meta
                            </label>
                            <textarea
                                value={editingSeo.description}
                                onChange={(e) => setEditingSeo({ ...editingSeo, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Description courte pour les moteurs de recherche..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mots-clés (séparés par des virgules)
                            </label>
                            <input
                                type="text"
                                value={editingSeo.keywords.join(', ')}
                                onChange={(e) => setEditingSeo({
                                    ...editingSeo,
                                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                                })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="portfolio, développeur, react..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center gap-2 transition-colors"
                            >
                                <FiSave className="w-4 h-4" />
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
