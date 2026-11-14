import Head from 'next/head';

interface JSONLDProps {
  type: 'Person' | 'ProfessionalService' | 'LocalBusiness' | 'WebPage' | 'CollectionPage';
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
    description: 'Développement web, création vidéo et matériel : trois domaines de travail, une seule méthode.',
  },
  developpeur: {
    name: 'Développement Web & Architecture',
    serviceType: 'Développement Web & Architecture Logicielle',
    description: 'Applications web complètes avec Next.js, Node.js et MongoDB, de l\'interface à la base de données.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Mehmet Salih K.',
    }
  },
  designer: {
    name: 'Design & Vidéo',
    serviceType: 'Design d\'Interface & Identité Visuelle',
    description: 'Interfaces haute fidélité, systèmes de design et production vidéo, du tournage à l\'étalonnage.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Mehmet Salih K.',
    }
  },
  maker: {
    name: 'Hardware & IoT',
    serviceType: 'Systèmes Embarqués & Prototypage',
    description: 'Diagnostic électronique, firmware (ESP32/Arduino) et systèmes connectés, du capteur à l\'interface.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Mehmet Salih K.',
    }
  }
};
