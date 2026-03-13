import { useState, useEffect } from 'react';
import { FiSend, FiMail, FiLinkedin, FiGithub, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
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

      <main className="relative min-h-screen dark:bg-[#09090f] bg-white pt-40 pb-32 overflow-hidden">
        {/* Ambient Background Effects synchronized with Strategy */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] dark:bg-indigo-600/5 bg-indigo-50/40 rounded-full blur-[120px] opacity-70" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] dark:bg-violet-600/5 bg-violet-50/30 rounded-full blur-[120px] opacity-70" />
          <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-24 text-center"
          >
            <div className="inline-flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
              <span className="w-10 h-[1px] bg-indigo-500" />
              Initialisation du Contact
              <span className="w-10 h-[1px] bg-indigo-500" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black dark:text-white text-zinc-900 tracking-tight mb-8">
              Lançons votre <span className="text-indigo-600 dark:text-indigo-500">Projet</span>.
            </h1>
            <p className="dark:text-zinc-500 text-zinc-600 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Une idée ? Un défi technique ? Ou simplement envie d&apos;échanger sur le futur du numérique ? Mon canal de communication est ouvert.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Section */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="dark:bg-zinc-900/40 bg-white backdrop-blur-xl rounded-[3rem] p-10 md:p-14 dark:border-white/5 border-zinc-200 border shadow-sm hover:shadow-2xl transition-all duration-500">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prénom</label>
                      <input 
                        type="text" 
                        value={formData.firstName} 
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Ex: Alexandre"
                        className="w-full h-14 px-6 rounded-2xl dark:bg-white/5 bg-zinc-50 dark:border-white/5 border-zinc-100 border focus:border-indigo-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-zinc-600"
                        required 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nom</label>
                      <input 
                        type="text" 
                        value={formData.lastName} 
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Ex: Dubois"
                        className="w-full h-14 px-6 rounded-2xl dark:bg-white/5 bg-zinc-50 dark:border-white/5 border-zinc-100 border focus:border-indigo-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-zinc-600"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Adresse Email</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full h-14 px-6 rounded-2xl dark:bg-white/5 bg-zinc-50 dark:border-white/5 border-zinc-100 border focus:border-indigo-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-zinc-600"
                      required 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Votre Message</label>
                    <textarea 
                      value={formData.message} 
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Comment puis-je vous aider ?"
                      rows={6}
                      className="w-full p-6 rounded-2xl dark:bg-white/5 bg-zinc-50 dark:border-white/5 border-zinc-100 border focus:border-indigo-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-zinc-600 resize-none"
                      required 
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="group relative w-full h-16 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Envoyer le Message
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Side Info */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
              className="lg:col-span-5 space-y-8"
            >
              {/* Info Cards */}
              <div className="grid grid-cols-1 gap-6">
                 {/* Quick Contact Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    {contactLinks.map((link) => (
                      <a 
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-6 rounded-3xl dark:bg-zinc-900/40 bg-zinc-50 dark:border-white/5 border-zinc-100 border flex flex-col items-center justify-center gap-4 hover:border-indigo-500/30 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border dark:border-indigo-500/20 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                           <link.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest dark:text-zinc-500 text-zinc-400">{link.label}</span>
                      </a>
                    ))}
                 </div>

                 {/* Location & Response Card */}
                 <div className="p-10 rounded-[3rem] dark:bg-zinc-900/40 bg-zinc-50 dark:border-white/5 border-zinc-100 border">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <FiMapPin className="w-5 h-5 text-emerald-500" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Localisation</p>
                          <p className="text-lg font-black dark:text-white text-zinc-900">{cityName || 'France'}</p>
                       </div>
                    </div>
                    
                    <div className="p-6 rounded-2xl dark:bg-emerald-500/5 bg-emerald-100/30 border border-emerald-500/20">
                       <p className="text-sm dark:text-emerald-400 text-emerald-700 font-bold leading-relaxed">
                          SLA de Réponse : Je m&apos;engage à traiter chaque demande sous <span className="underline decoration-emerald-500/50 underline-offset-4">24 Heures</span> ouvrées.
                       </p>
                    </div>
                 </div>

                 {/* Minimal Map Overlay alternative or addition */}
                 <div className="h-[240px] rounded-[3rem] overflow-hidden border dark:border-white/5 border-zinc-100 grayscale hover:grayscale-0 transition-all duration-700 group relative">
                    {mapUrl && (
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                    <div className="absolute inset-0 pointer-events-none bg-indigo-500/5 group-hover:bg-transparent transition-colors" />
                 </div>
              </div>
            </motion.div>
          </div>
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