import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import ContactForm from '@/components/contact/ContactForm';

export default function Contact() {
  const { t } = useTranslation('contact');

  const contactMethods = [
    {
      icon: FaEnvelope,
      name: t('methods.email'),
      value: 'contact@example.com',
      href: 'mailto:contact@example.com',
    },
    {
      icon: FaLinkedin,
      name: 'LinkedIn',
      value: 'linkedin.com/in/your-profile',
      href: 'https://linkedin.com/in/your-profile',
    },
    {
      icon: FaGithub,
      name: 'GitHub',
      value: 'github.com/your-username',
      href: 'https://github.com/your-username',
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{t('title')} - Portfolio</title>
        <meta name="description" content={t('description')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('title')}
          </h1>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('getInTouch')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {t('contactText')}
                </p>

                <div className="space-y-6">
                  {contactMethods.map((method) => (
                    <a
                      key={method.name}
                      href={method.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <method.icon className="w-6 h-6" />
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm">{method.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('form.title')}
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'contact'])),
    },
  };
};
