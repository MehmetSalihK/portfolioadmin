import Head from 'next/head';

interface JSONLDProps {
  type: 'Person' | 'ProfessionalService' | 'LocalBusiness';
  data: any;
}

const JSONLD = ({ type, data }: JSONLDProps) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
};

export default JSONLD;

/**
 * Predefined schemas for the portfolio
 */
export const schemas = {
  me: {
    name: 'Mehmet Salih K.',
    jobTitle: 'Développeur Full Stack & Designer UI/UX',
    url: 'https://mehmetsalihk.fr',
    sameAs: [
      'https://github.com/mehmetsalihk',
      'https://linkedin.com/in/mehmetsalihk',
    ],
    description: 'Expert en création d\'applications web modernes, IoT et design digital haut de gamme.',
  },
  developpeur: {
    name: 'L\'Architecte Digital - Ingénierie Full Stack',
    serviceType: 'Développement Web & Architecture Logicielle',
    description: 'Conception d\'écosystèmes numériques scalables avec Next.js, Node.js et MongoDB. Audit de performance et SEO technique.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Mehmet Salih K.',
    }
  },
  designer: {
    name: 'L\'Artiste Digital - UI/UX & Branding',
    serviceType: 'Design d\'Interface & Identité Visuelle',
    description: 'Création d\'expériences immersives et d\'interfaces haute fidélité pour produits SaaS et digital de luxe.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Mehmet Salih K.',
    }
  },
  maker: {
    name: 'Le Builder - Ingénierie Hardware & IoT',
    serviceType: 'Systèmes Embarqués & Prototypage Hardware',
    description: 'Diagnostic électronique, programmation firmware (ESP32/Arduino) et création de solutions connectées industrielles.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Mehmet Salih K.',
    }
  }
};
