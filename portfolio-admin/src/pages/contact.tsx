import { useState, useEffect } from 'react';
import { FiSend, FiMail, FiLinkedin, FiGithub, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
import useAnalytics from '@/utils/hooks/useAnalytics';
import { motion } from 'framer-motion';

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
  useAnalytics({ enabled: true, updateInterval: 30000, trackTimeSpent: true });

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
        toast.success('Message envoyé avec succès !');
        setFormData({ firstName: '', lastName: '', company: '', phone: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Erreur lors de l\'envoi');
      }
    } catch {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const inputCls = 'w-full dark:bg-white/5 bg-zinc-100 dark:text-white text-zinc-900 px-4 py-3 rounded-xl dark:border-white/10 border-zinc-200 border dark:focus:border-indigo-500/50 focus:border-indigo-400 focus:ring-1 dark:focus:ring-indigo-500/30 focus:ring-indigo-300 transition-all outline-none font-medium dark:placeholder:text-zinc-600 placeholder:text-zinc-400 text-sm';
  const labelCls = 'block text-xs font-semibold dark:text-zinc-400 text-zinc-500 mb-2';

  const contactLinks = [
    { label: 'Email', value: settings.email, href: `mailto:${settings.email}`, icon: FiMail, show: !!settings.email },
    { label: 'LinkedIn', value: settings.linkedin?.replace('https://www.linkedin.com/in/', ''), href: settings.linkedin, icon: FiLinkedin, show: !!settings.linkedin },
    { label: 'GitHub', value: settings.github?.replace('https://github.com/', ''), href: settings.github, icon: FiGithub, show: !!settings.github },
    { label: 'WhatsApp', value: 'WhatsApp', href: settings.whatsapp, icon: FaWhatsapp, show: !!settings.whatsapp },
    { label: 'Telegram', value: 'Telegram', href: settings.telegram, icon: FaTelegram, show: !!settings.telegram },
  ].filter(l => l.show);

  return (
    <Layout>
      <Head>
        <title>Contact — Portfolio</title>
        <meta name="description" content="Contactez-moi pour vos projets" />
      </Head>

      {/* Ambient blobs — dark only */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 dark:opacity-100 opacity-0 transition-opacity">
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-8 h-[1px] bg-indigo-500" />
            Disponible
          </div>
          <h1 className="text-4xl md:text-5xl font-black dark:text-white text-zinc-900 tracking-tight mb-4">
            Travaillons ensemble.
          </h1>
          <p className="dark:text-zinc-400 text-zinc-600 text-lg font-medium max-w-xl">
            Je suis ouvert aux nouvelles opportunités. N&apos;hésitez pas à me contacter pour discuter de vos projets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact form — 3/5 */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
            <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl dark:border-white/5 border-zinc-200 border p-8 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em] mb-6">
                <FiSend className="w-4 h-4" />
                Envoyer un message
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Prénom *</label>
                    <input type="text" value={formData.firstName} placeholder="John"
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Nom *</label>
                    <input type="text" value={formData.lastName} placeholder="Doe"
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className={inputCls} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Société <span className="dark:text-zinc-700 text-zinc-400 normal-case font-medium tracking-normal">(optionnel)</span></label>
                    <input type="text" value={formData.company} placeholder="Entreprise SA"
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Téléphone <span className="dark:text-zinc-700 text-zinc-400 normal-case font-medium tracking-normal">(optionnel)</span></label>
                    <input type="tel" value={formData.phone} placeholder="+33 6 00 00 00 00"
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={formData.email} placeholder="email@exemple.com"
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={inputCls} required />
                </div>

                <div>
                  <label className={labelCls}>Sujet *</label>
                  <input type="text" value={formData.subject} placeholder="Opportunité de projet, question..."
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className={inputCls} required />
                </div>

                <div>
                  <label className={labelCls}>Message *</label>
                  <textarea value={formData.message} placeholder="Décrivez votre projet ou votre demande..."
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    rows={5} className={`${inputCls} resize-none`} required />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  <FiSend className="w-4 h-4" />
                  {isSending ? 'Envoi en cours…' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact info — 2/5 */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="lg:col-span-2 flex flex-col gap-5">
            {/* Quick links card */}
            <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl dark:border-white/5 border-zinc-200 border p-7 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.2em] mb-5">
                Restons en contact
              </div>
              <div className="space-y-3">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.label !== 'Email' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 dark:bg-white/5 bg-zinc-50 dark:hover:bg-indigo-500/10 hover:bg-indigo-50 dark:border-white/5 border-zinc-200 border dark:hover:border-indigo-500/20 hover:border-indigo-300 rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center dark:text-indigo-400 text-indigo-600 flex-shrink-0">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold dark:text-zinc-500 text-zinc-500">{link.label}</p>
                      <p className="text-sm font-medium dark:text-zinc-300 text-zinc-700 dark:group-hover:text-white group-hover:text-zinc-900 transition-colors truncate">
                        {link.value}
                      </p>
                    </div>
                    <FiArrowRight className="w-4 h-4 dark:text-zinc-600 text-zinc-400 dark:group-hover:text-indigo-400 group-hover:text-indigo-500 transition-colors ml-auto flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Location card */}
            <div className="dark:bg-zinc-900/60 bg-white backdrop-blur-sm rounded-3xl dark:border-white/5 border-zinc-200 border overflow-hidden shadow-sm">
              {mapUrl && (
                <div className="relative h-44">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              )}
              <div className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl dark:bg-indigo-500/10 bg-indigo-50 flex items-center justify-center dark:text-indigo-400 text-indigo-600 flex-shrink-0">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold dark:text-zinc-500 text-zinc-500">Localisation</p>
                  <p className="text-sm font-medium dark:text-zinc-300 text-zinc-700">
                    {settings.position || cityName || 'France'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Response time */}
            <div className="p-4 rounded-2xl dark:bg-emerald-500/5 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200">
              <p className="text-sm dark:text-emerald-400 text-emerald-700 font-medium">
                Temps de réponse : généralement sous 24 heures
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
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
        }
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
        }
      },
      revalidate: 60
    };
  }
};