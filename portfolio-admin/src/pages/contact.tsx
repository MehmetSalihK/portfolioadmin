import { useState, useEffect } from 'react';
import { FiSend, FiMail, FiLinkedin, FiGithub, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';

interface ContactPageProps {
  settings: {
    email: string;
    github: string;
    linkedin: string;
    position: string;
    whatsapp?: string;
    telegram?: string;
  };
}

export default function ContactPage({ settings = { email: '', github: '', linkedin: '', position: '' } }: ContactPageProps) {
  const { locale } = useRouter();
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', company: '', phone: '',
    email: '', subject: '', message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    if (settings.position) {
      fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(settings.position)}&limit=1`)
        .then(r => r.json())
        .then(data => {
          if (data.features?.length) {
            const f = data.features[0];
            const name = f.properties.city || f.properties.label;
            setCityName(name);
            setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(name)}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
          }
        }).catch(() => {});
    } else {
      setCityName('Nogent-sur-Oise, France');
      setMapUrl('https://maps.google.com/maps?q=Nogent-sur-Oise,%20France&t=&z=13&ie=UTF8&iwloc=&output=embed');
    }
  }, [settings.position]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success(t('contact.toast.success'));
        setFormData({ firstName: '', lastName: '', company: '', phone: '', email: '', subject: '', message: '' });
      } else {
        toast.error(t('contact.toast.error'));
      }
    } catch {
      toast.error(t('contact.toast.error_general'));
    } finally {
      setIsSending(false);
    }
  };

  const inputCls = 'w-full dark:bg-white/[0.03] bg-zinc-50 dark:text-white text-zinc-900 px-4 py-3 rounded-xl dark:border-white/[0.07] border-zinc-200 border dark:focus:border-indigo-500/40 focus:border-indigo-400 focus:ring-0 outline-none dark:placeholder:text-zinc-600 placeholder:text-zinc-400 text-sm font-medium transition-colors duration-150';
  const labelCls = 'block text-[11px] font-semibold dark:text-zinc-500 text-zinc-500 mb-2 uppercase tracking-wider';

  const contactLinks = [
    { label: 'Email', value: settings.email, href: `mailto:${settings.email}`, icon: FiMail, show: !!settings.email },
    { label: 'LinkedIn', value: 'LinkedIn', href: settings.linkedin, icon: FiLinkedin, show: !!settings.linkedin },
    { label: 'GitHub', value: 'GitHub', href: settings.github, icon: FiGithub, show: !!settings.github },
    { label: 'WhatsApp', value: 'WhatsApp', href: settings.whatsapp, icon: FaWhatsapp, show: !!settings.whatsapp },
    { label: 'Telegram', value: 'Telegram', href: settings.telegram, icon: FaTelegram, show: !!settings.telegram },
  ].filter(l => l.show);

  return (
    <Layout>
      <Head>
        <title>{t('nav.contact')} — Portfolio</title>
        <meta name="description" content={t('contact.hero_description')} />
      </Head>

      <main className="min-h-screen dark:bg-[#0a0a0f] bg-[#fafafc] pt-14">
        <div className="max-w-[1100px] mx-auto px-6 pt-20 pb-24">

          {/* ── Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
            className="mb-16"
          >
            <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-5">
              {t('contact.subtitle')}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold dark:text-white text-zinc-900 tracking-tight mb-5 text-balance">
              {t('contact.hero_title_part1')} <span className="text-indigo-500 italic">{t('contact.hero_title_part2')}</span>.
            </h1>
            <p className="dark:text-zinc-500 text-zinc-500 text-lg max-w-[520px] leading-[1.75]">
              {t('contact.hero_description')}
            </p>
          </motion.div>

          {/* ── Séparateur ── */}
          <div className="border-t dark:border-white/[0.05] border-zinc-100 mb-12" />

          {/* ── Grid formulaire + infos ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35, ease: [0.2, 0, 0, 1] }}
              className="lg:col-span-7"
            >
              <div className="dark:bg-white/[0.02] bg-white rounded-2xl p-6 md:p-8 border dark:border-white/[0.06] border-zinc-200">
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{t('contact.form.firstname')}</label>
                      <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder={t('contact.form.placeholder_firstname')} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>{t('contact.form.lastname')}</label>
                      <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder={t('contact.form.placeholder_lastname')} className={inputCls} required />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>{t('contact.form.email')}</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('contact.form.placeholder_email')} className={inputCls} required />
                  </div>

                  <div>
                    <label className={labelCls}>{t('contact.form.subject')}</label>
                    <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t('contact.form.placeholder_subject')} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>{t('contact.form.message')}</label>
                    <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('contact.form.placeholder_message')} rows={5}
                      className={`${inputCls} resize-none`} required />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors duration-150 shadow-lg shadow-indigo-600/20"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t('contact.form.send')}
                        <FiSend className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Infos */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.35, ease: [0.2, 0, 0, 1] }}
              className="lg:col-span-5 space-y-4"
            >
              {/* Liens rapides */}
              {contactLinks.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {contactLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-4 dark:bg-white/[0.02] bg-white rounded-xl border dark:border-white/[0.06] border-zinc-200 hover:dark:border-indigo-500/30 hover:border-indigo-200 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg dark:bg-indigo-500/10 bg-indigo-50 border dark:border-indigo-500/20 border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:border-transparent transition-all duration-200">
                        <link.icon className="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[12px] font-semibold dark:text-zinc-400 text-zinc-500">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Localisation + SLA */}
              <div className="dark:bg-white/[0.02] bg-white rounded-xl p-5 border dark:border-white/[0.06] border-zinc-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-100 flex items-center justify-center shrink-0">
                    <FiMapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold dark:text-zinc-600 text-zinc-400 uppercase tracking-widest mb-0.5">{t('contact.info.location')}</div>
                    <div className="text-sm font-semibold dark:text-white text-zinc-900">{cityName || (locale === 'fr' ? 'France' : (locale === 'tr' ? 'Fransa' : 'France'))}</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg dark:bg-emerald-500/[0.05] bg-emerald-50 border dark:border-emerald-500/20 border-emerald-100">
                  <p className="text-xs dark:text-emerald-400 text-emerald-700 leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: t('contact.info.sla') }} />
                  </p>
                </div>
              </div>

              {/* Carte */}
              {mapUrl && (
                <div className="rounded-xl overflow-hidden border dark:border-white/[0.06] border-zinc-200 h-[180px] grayscale hover:grayscale-0 transition-all duration-500">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'fr';
  try {
    await connectDB();
    const settings = await Setting.findOne().lean() as any;
    return {
      props: {
        settings: {
          email: settings?.email || 'contact@mehmetsalihk.fr',
          github: settings?.github || 'https://github.com/mehmetsalihk',
          linkedin: settings?.linkedin || 'https://www.linkedin.com/in/mehmetsalihk/',
          position: settings?.position || '60180 Nogent-sur-Oise',
          whatsapp: settings?.whatsapp || '',
          telegram: settings?.telegram || '',
        },
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60
    };
  } catch {
    return {
      props: {
        settings: {
          email: 'contact@mehmetsalihk.fr',
          github: 'https://github.com/mehmetsalihk',
          linkedin: 'https://www.linkedin.com/in/mehmetsalihk/',
          position: '60180 Nogent-sur-Oise',
          whatsapp: '',
          telegram: '',
        },
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60
    };
  }
};