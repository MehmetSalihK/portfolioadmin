import { useState } from 'react';
import { FiSend, FiMail, FiLinkedin, FiGithub, FiMapPin, FiPhone, FiArrowUpRight } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import JSONLD, { schemas } from '@/components/layout/JSONLD';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import SectionHead from '@/components/ui/SectionHead';
import { SectionMark } from '@/components/identity/Marks';
import { Reveal, RevealLines } from '@/components/motion/Reveal';

interface ContactPageProps {
  settings: {
    email: string;
    github: string;
    linkedin: string;
    position: string;
    phone: string;
    whatsapp?: string;
    telegram?: string;
  };
}

export default function ContactPage({ settings = { email: '', github: '', linkedin: '', position: '', phone: '' } }: ContactPageProps) {
  const { locale } = useRouter();
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', company: '', phone: '',
    email: '', subject: '', message: ''
  });
  const [isSending, setIsSending] = useState(false);
  /* Retour du formulaire aussi annoncé aux lecteurs d'écran (role=status) */
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setFormStatus('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success(t('contact.toast.success'));
        setFormStatus(t('contact.toast.success'));
        setFormData({ firstName: '', lastName: '', company: '', phone: '', email: '', subject: '', message: '' });
      } else {
        toast.error(t('contact.toast.error'));
        setFormStatus(t('contact.toast.error'));
      }
    } catch {
      toast.error(t('contact.toast.error_general'));
      setFormStatus(t('contact.toast.error_general'));
    } finally {
      setIsSending(false);
    }
  };

  /* Bordereau : champs soulignés, jamais de boîtes arrondies.
     `focus:outline-none` est retiré : le contour `:focus-visible` global
     (vermillon, 2px) doit rester visible au clavier — le changement de
     filet en accent reste le repère visuel au pointeur. */
  const field =
    'w-full bg-transparent border-0 border-b border-[rgb(var(--foreground-rgb))]/25 px-0 py-3 text-[1rem] text-[rgb(var(--foreground-rgb))] placeholder:text-[rgb(var(--foreground-rgb))]/60 focus:border-[var(--accent)] transition-colors duration-300 rounded-none';
  const label =
    'block font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/60 mb-1';

  const contactLinks = [
    { label: 'Email', value: settings.email, href: `mailto:${settings.email}`, icon: FiMail, show: !!settings.email },
    { label: 'LinkedIn', value: 'LinkedIn', href: settings.linkedin, icon: FiLinkedin, show: !!settings.linkedin },
    { label: 'GitHub', value: 'GitHub', href: settings.github, icon: FiGithub, show: !!settings.github },
    { label: 'WhatsApp', value: 'WhatsApp', href: settings.whatsapp, icon: FaWhatsapp, show: !!settings.whatsapp },
    { label: 'Telegram', value: 'Telegram', href: settings.telegram, icon: FaTelegram, show: !!settings.telegram },
    { label: 'Phone', value: settings.phone, href: `tel:${settings.phone}`, icon: FiPhone, show: !!settings.phone },
  ].filter(l => l.show);

  return (
    <Layout>
      <JSONLD
        type="ProfessionalService"
        data={{
          name: schemas.me.name,
          url: schemas.me.url,
          description: schemas.me.description,
          email: settings.email || undefined,
          sameAs: schemas.me.sameAs,
        }}
      />
      <Head>
        <title>{`${t('nav.contact')} — Portfolio`}</title>
        <meta name="description" content={t('contact.hero_description')} />
        <meta property="og:title" content={`${t('nav.contact')} — Portfolio`} />
        <meta property="og:description" content={t('contact.hero_description')} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* ════════════ OUVERTURE ════════════ */}
      <section className="relative pt-[8.5rem] pb-2">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-9 border-b border-[rgb(var(--foreground-rgb))]/15">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              {t('nav.contact')} — {t('page_label.contact')}
            </span>
            <span className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60">
              <span className="w-1.5 h-1.5 bg-[var(--accent)]" />
              {t('hero.status')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-8">
            <div className="lg:col-span-8">
              <h1 className="font-display font-black text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.05em] m-0 text-balance">
                <RevealLines delay={0.1} stagger={0.1}>
                  <span>
                    {t('contact.hero_title_part1')}{' '}
                    <span className="font-accent text-[1.1em] text-[var(--accent-text)] dark:text-[var(--accent)]">
                      {t('contact.hero_title_part2')}
                    </span>
                    <span className="text-[var(--accent-text)] dark:text-[var(--accent)]">.</span>
                  </span>
                </RevealLines>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-3">
              <Reveal delay={0.3}>
                <p className="lead m-0">{t('contact.hero_description')}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 01 — BORDERAU : la lumière s'éteint ════════════ */}
      <section className="relative mt-[var(--section-gap)] encre-block">
        <div className="mx-auto w-full px-[var(--container-px)] max-w-[var(--container-max)] pb-[var(--section-gap)] pt-[var(--section-gap)]">
          <SectionHead
            index="01"
            kicker={t('contact.subtitle')}
            sigil={<SectionMark name="contact" />}
            title={t('contact.form_title')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-x-[var(--gutter)] gap-y-14 items-start">

            {/* — Formulaire — */}
            <div className="lg:col-span-7">
              <Reveal>
                <form onSubmit={handleSubmit} className="border-t border-[rgb(var(--foreground-rgb))]/20 pt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                    <div>
                      <label className={label} htmlFor="c-first">
                        {t('contact.form.firstname')}
                        <span aria-hidden="true" className="text-[var(--accent-text)]"> *</span>
                      </label>
                      <input
                        id="c-first" name="firstName" type="text" autoComplete="given-name"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder={t('contact.form.placeholder_firstname')}
                        className={field} required
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor="c-last">
                        {t('contact.form.lastname')}
                        <span aria-hidden="true" className="text-[var(--accent-text)]"> *</span>
                      </label>
                      <input
                        id="c-last" name="lastName" type="text" autoComplete="family-name"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder={t('contact.form.placeholder_lastname')}
                        className={field} required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="c-email">
                        {t('contact.form.email')}
                        <span aria-hidden="true" className="text-[var(--accent-text)]"> *</span>
                      </label>
                      <input
                        id="c-email" name="email" type="email" autoComplete="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('contact.form.placeholder_email')}
                        className={field} required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="c-subject">{t('contact.form.subject')}</label>
                      <input
                        id="c-subject" name="subject" type="text"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={t('contact.form.placeholder_subject')}
                        className={field}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="c-message">
                        {t('contact.form.message')}
                        <span aria-hidden="true" className="text-[var(--accent-text)]"> *</span>
                      </label>
                      <textarea
                        id="c-message" name="message" rows={6} value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('contact.form.placeholder_message')}
                        className={`${field} resize-none leading-relaxed`} required
                      />
                    </div>
                  </div>

                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--foreground-rgb))]/65 mt-7 mb-0">
                    {t('contact.form.required_note')}
                  </p>

                  {/* Retour du formulaire annoncé poliment */}
                  <p role="status" className="sr-only">{formStatus}</p>

                  <div className="flex flex-wrap items-center justify-between gap-5 mt-10 pt-7 border-t border-[rgb(var(--foreground-rgb))]/12">
                    <p className="font-mono text-[11px] leading-relaxed text-[rgb(var(--foreground-rgb))]/60 m-0 max-w-[34ch]">
                      <span dangerouslySetInnerHTML={{ __html: t('contact.info.sla') }} />
                    </p>
                    <button
                      type="submit"
                      disabled={isSending}
                      aria-busy={isSending}
                      aria-label={t('contact.form.send')}
                      className="btn btn-primary"
                    >
                      {isSending ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-[#14130f]/40 border-t-[#14130f] animate-spin" />
                      ) : (
                        <>
                          {t('contact.form.send')}
                          <FiSend className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Reveal>
            </div>

            {/* — Index des canaux — */}
            <aside className="lg:col-span-4 lg:col-start-9">
              <Reveal delay={0.1}>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--foreground-rgb))]/60 mb-4">
                  {t('contact.subtitle_small')}
                </p>

                <ul className="list-none p-0 m-0 border-t border-[rgb(var(--foreground-rgb))]/20">
                  {contactLinks.map((link, i) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.label === 'Email' ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 py-4 border-b border-[rgb(var(--foreground-rgb))]/12 hover:bg-[var(--color-surface)] transition-colors duration-[400ms] ease-out-expo -mx-3 px-3"
                      >
                        <span className="index-num tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        <link.icon className="w-4 h-4 text-[rgb(var(--foreground-rgb))]/60 transition-colors group-hover:text-[var(--accent)]" />
                        <span className="text-[0.95rem] text-[rgb(var(--foreground-rgb))]/75 group-hover:text-[rgb(var(--foreground-rgb))] transition-colors">
                          {link.label}
                        </span>
                        <FiArrowUpRight className="ml-auto w-3.5 h-3.5 hover-reveal text-[var(--accent)] group-hover:translate-x-0" />
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Localisation + engagement de délai */}
                <div className="mt-10 border border-[rgb(var(--foreground-rgb))]/15 p-6">
                  <div className="flex items-start gap-3.5">
                    <FiMapPin className="w-4 h-4 mt-0.5 text-[var(--accent-text)] dark:text-[var(--accent)] shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--foreground-rgb))]/60 m-0 mb-1.5">
                        {t('contact.info.location')}
                      </p>
                      <p className="text-[1rem] font-medium m-0 text-[rgb(var(--foreground-rgb))]">
                        {locale === 'fr' ? 'France' : (locale === 'tr' ? 'Fransa' : 'France')}
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[rgb(var(--foreground-rgb))]/12 my-5" />

                  <p className="font-mono text-[11px] leading-[1.7] text-[rgb(var(--foreground-rgb))]/60 m-0">
                    <span dangerouslySetInnerHTML={{ __html: t('contact.info.sla') }} />
                  </p>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
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
          phone: settings?.phone || '',
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
          phone: '',
          whatsapp: '',
          telegram: '',
        },
        ...(await serverSideTranslations(currentLocale, ['common'])),
      },
      revalidate: 60
    };
  }
};
