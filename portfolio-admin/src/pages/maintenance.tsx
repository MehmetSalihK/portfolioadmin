import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';

interface MaintenanceProps {
  title: string;
  message: string;
  estimatedEndTime?: string;
}

const MaintenancePage = ({ title, message, estimatedEndTime }: MaintenanceProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!estimatedEndTime) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = new Date(estimatedEndTime).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        let timeString = '';
        if (days > 0) timeString += `${days}j `;
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0) timeString += `${minutes}m `;
        timeString += `${seconds}s`;

        setTimeRemaining(timeString);
      } else {
        setTimeRemaining('Bientôt disponible');
        // Recharger la page après la fin de la maintenance
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [estimatedEndTime]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={message} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icône de maintenance */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm">
              <svg 
                className="w-12 h-12 text-white animate-spin" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {title}
          </h1>

          {/* Message */}
          <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Compte à rebours */}
          {estimatedEndTime && timeRemaining && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">
                Temps estimé avant la remise en service :
              </h2>
              <div className="text-3xl font-mono font-bold text-yellow-300">
                {timeRemaining}
              </div>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Que se passe-t-il ?
            </h3>
            <p className="text-white/70 mb-4">
              Nous effectuons actuellement des améliorations sur notre site pour vous offrir une meilleure expérience.
            </p>
            <p className="text-white/70">
              Merci de votre patience. Vous pouvez actualiser cette page pour vérifier si le site est de nouveau disponible.
            </p>
          </div>

          {/* Bouton de rechargement */}
          <button
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Actualiser la page
          </button>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Récupérer les informations de maintenance
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/maintenance`);
    
    if (response.ok) {
      const maintenanceData = await response.json();
      
      // Si la maintenance n'est pas activée, rediriger vers l'accueil
      if (!maintenanceData.isEnabled) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
      
      return {
        props: {
          title: maintenanceData.title || 'Site en maintenance',
          message: maintenanceData.message || 'Le site est actuellement en maintenance. Veuillez revenir plus tard.',
          estimatedEndTime: maintenanceData.estimatedEndTime || null,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching maintenance data:', error);
  }
  
  // Valeurs par défaut en cas d'erreur
  return {
    props: {
      title: 'Site en maintenance',
      message: 'Le site est actuellement en maintenance. Veuillez revenir plus tard.',
    },
  };
};

export default MaintenancePage;