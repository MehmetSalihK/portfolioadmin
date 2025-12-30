import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Maintenance from '../models/Maintenance';
import connectDB from '../lib/db';

interface MaintenancePageProps {
  maintenanceData: {
    title: string;
    message: string;
    estimatedEndTime?: string;
  } | null;
}

export default function MaintenancePage({ maintenanceData }: MaintenancePageProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotsTimer);
  }, []);

  useEffect(() => {
    if (maintenanceData?.estimatedEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(maintenanceData.estimatedEndTime!).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Bientôt disponible');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [maintenanceData?.estimatedEndTime]);

  return (
    <>
      <Head>
        <title>{maintenanceData?.title || 'Maintenance en cours'}</title>
        <meta name="description" content="Site en maintenance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen bg-gray-900 flex items-center justify-center p-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
         <div className="text-center max-w-2xl mx-auto">
           {/* Main Message */}
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-8 leading-tight tracking-tight">
             Le site est actuellement en maintenance
           </h1>
           
           <p className="text-xl md:text-2xl text-gray-300 mb-12 font-normal">
             Merci de revenir plus tard{dots}
           </p>

           {/* Countdown if available */}
           {timeLeft && (
             <div className="mb-8">
               <div className="inline-block bg-gray-800 text-gray-200 px-6 py-3 rounded-lg font-medium text-lg border border-gray-700">
                 Retour estimé dans : {timeLeft}
               </div>
             </div>
           )}

           {/* Action buttons */}
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <button 
               onClick={() => window.location.reload()}
               className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors duration-200 border border-white"
             >
               Actualiser la page
             </button>
             
             <a 
                href="mailto:contact@mehmetsalihk.fr"
                className="bg-transparent text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors duration-200 border border-gray-600 hover:border-gray-500"
              >
                Nous contacter
              </a>
           </div>
         </div>
       </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    await connectDB();
    
    const maintenance = await Maintenance.findOne({ isEnabled: true });
    
    if (!maintenance) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    
    return {
      props: {
        maintenanceData: {
          title: maintenance.title || 'Site en maintenance',
          message: maintenance.message || 'Le site est actuellement en maintenance. Veuillez revenir plus tard.',
          estimatedEndTime: maintenance.estimatedEndTime ? maintenance.estimatedEndTime.toISOString() : null,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching maintenance data:', error);
    
    return {
      props: {
        maintenanceData: {
          title: 'Site en maintenance',
          message: 'Le site est actuellement en maintenance. Veuillez revenir plus tard.',
        },
      },
    };
  }
};