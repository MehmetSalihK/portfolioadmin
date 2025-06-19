import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CVModal({ isOpen, onClose }: CVModalProps) {
  const handleDownload = () => {
    // Ouvrir le CV dans un nouvel onglet pour téléchargement
    window.open('/cv', '_blank');
  };

  const handleExternalView = () => {
    // Ouvrir le CV dans un nouvel onglet
    window.open('/cv', '_blank');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                    Mon CV
                  </Dialog.Title>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Télécharger le CV"
                    >
                      <FiDownload className="w-4 h-4 mr-2" />
                      Télécharger
                    </button>
                    <button
                      onClick={handleExternalView}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <FiExternalLink className="w-4 h-4 mr-2" />
                      Nouvel onglet
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="p-6">
                  <div className="w-full h-[70vh] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <iframe
                      src="/cv"
                      className="w-full h-full border-0"
                      title="CV Preview"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cliquez sur "Télécharger" pour sauvegarder le CV ou "Nouvel onglet" pour l'ouvrir dans une nouvelle fenêtre.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}