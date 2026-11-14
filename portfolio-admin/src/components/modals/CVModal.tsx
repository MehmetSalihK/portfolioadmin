import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';
import { useTranslation } from 'next-i18next/pages';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CVModal({ isOpen, onClose }: CVModalProps) {
  const { t } = useTranslation('common');

  const handleDownload = () => {
    window.open('/cv', '_blank');
  };

  const handleExternalView = () => {
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
              {/* Bloc d'encre carré, filets 1px — langage TRACÉ.
                  Header/footer en wrap : à 390px les actions passent
                  sur une seconde ligne au lieu de se comprimer. */}
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden bg-[rgb(var(--background-start-rgb))] border border-[rgb(var(--foreground-rgb))]/20 shadow-lift transition-all">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 border-b border-[rgb(var(--foreground-rgb))]/15">
                  <Dialog.Title className="font-mono text-[11px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 m-0">
                    {t('cv_modal.title')}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="btn btn-outline !h-11 !px-4 text-[11px]"
                      title={t('cv_modal.download_tooltip')}
                    >
                      <FiDownload className="w-4 h-4" />
                      {t('cv_modal.download')}
                    </button>
                    <button
                      onClick={handleExternalView}
                      className="btn btn-outline !h-11 !px-4 text-[11px]"
                      title={t('cv_modal.new_tab_tooltip')}
                    >
                      <FiExternalLink className="w-4 h-4" />
                      {t('cv_modal.new_tab')}
                    </button>
                    <button
                      onClick={onClose}
                      aria-label={t('cv_modal.close')}
                      className="w-11 h-11 flex items-center justify-center border border-[rgb(var(--foreground-rgb))]/25 text-[rgb(var(--foreground-rgb))]/60 hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-[#14130f] transition-all duration-300"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="p-4 sm:p-6">
                  <div className="w-full h-[65vh] sm:h-[70vh] border border-[rgb(var(--foreground-rgb))]/12 overflow-hidden bg-[var(--color-surface)]">
                    <iframe
                      src="/cv"
                      className="w-full h-full border-0"
                      title={t('cv_modal.title')}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-4 border-t border-[rgb(var(--foreground-rgb))]/15">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/60 m-0">
                      {t('cv_modal.footer_text')}
                    </p>
                    <button
                      onClick={onClose}
                      className="btn btn-dark !h-11 !px-5 text-[11px]"
                    >
                      {t('cv_modal.close')}
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