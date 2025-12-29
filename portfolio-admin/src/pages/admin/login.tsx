import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { authOptions } from '../api/auth/[...nextauth]';
import { loginSchema } from '@/utils/schemas';
import { FiMail, FiLock, FiLogIn, FiUser, FiShield, FiZap, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';

// Particules flottantes
const FloatingParticles = ({ animationsEnabled }: { animationsEnabled: boolean }) => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gray-600/20 rounded-full"
          initial={{
            x: Math.random() * 1200,
            y: Math.random() * 800,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={animationsEnabled ? {
            y: [null, Math.random() * 800],
            x: [null, Math.random() * 1200],
            scale: [null, Math.random() * 0.8 + 0.4],
            opacity: [null, Math.random() * 0.6 + 0.1]
          } : {}}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: animationsEnabled ? Infinity : 0,
            repeatType: "reverse",
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Variantes d'animation pour les inputs
const inputVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
    borderColor: "rgb(59, 130, 246)"
  },
  blur: {
    scale: 1,
    boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
    borderColor: "rgb(75, 85, 99)"
  }
};

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [backgroundAnimationsEnabled, setBackgroundAnimationsEnabled] = useState(true);

  // ... inside component

  // ... inside component
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation Zod client-side
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Tentative de connexion avec 2FA...');
      // ... rest of the code
      
      // Étape 1: Envoyer le code 2FA
      const response = await fetch('/api/auth/send-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Code 2FA envoyé, redirection vers la vérification...');
        
        // Stocker temporairement les informations pour la vérification
        sessionStorage.setItem('2fa-email', email);
        sessionStorage.setItem('temp-password', password);
        
        // Rediriger vers la page de vérification 2FA
        router.push(`/admin/verify-2fa?email=${encodeURIComponent(email)}`);
      } else {
        console.error('Erreur lors de l\'envoi du code 2FA:', data.error);
        setError(data.error || 'Erreur lors de l\'envoi du code de vérification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('La connexion a échoué. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Console filtering removed for debugging
  }, []);

  return (
    <>
      <Head>
        <title>Admin Login - Portfolio</title>
        <meta name="theme-color" content="#0a0a0a" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-200 relative overflow-hidden">
        {/* Particules flottantes */}
        <FloatingParticles animationsEnabled={backgroundAnimationsEnabled} />
        
        {/* Arrière-plan galactique */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Galaxie en arrière-plan */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-blue-900/10 to-black opacity-60"></div>
          
          {/* Étoiles scintillantes */}
          {Array.from({ length: 200 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2
              }}
              animate={backgroundAnimationsEnabled ? {
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1.5, 0.5]
              } : {}}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: backgroundAnimationsEnabled ? Infinity : 0,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
          
          {/* Nébuleuses colorées */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"
            animate={backgroundAnimationsEnabled ? {
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 360]
            } : {}}
            transition={{
              duration: 30,
              repeat: backgroundAnimationsEnabled ? Infinity : 0,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-radial from-cyan-500/8 via-blue-500/4 to-transparent rounded-full blur-3xl"
            animate={backgroundAnimationsEnabled ? {
              scale: [1.2, 0.8, 1.2],
              opacity: [0.1, 0.3, 0.1],
              rotate: [360, 0]
            } : {}}
            transition={{
              duration: 25,
              repeat: backgroundAnimationsEnabled ? Infinity : 0,
              ease: "linear"
            }}
          />
          
          {/* Voie lactée */}
           <motion.div
             className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-45 blur-sm"
             animate={backgroundAnimationsEnabled ? {
               opacity: [0.1, 0.2, 0.1]
             } : {}}
             transition={{
               duration: 15,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "easeInOut"
             }}
           />
           
           {/* Planètes du système solaire */}
           {/* Soleil */}
           <motion.div
             className="absolute top-10 right-20 w-24 h-24 rounded-full bg-gradient-radial from-yellow-300/30 via-orange-400/20 to-red-500/10 blur-sm"
             animate={backgroundAnimationsEnabled ? {
               scale: [1, 1.1, 1],
               opacity: [0.6, 0.8, 0.6],
               rotate: [0, 360]
             } : {}}
             transition={{
               duration: 20,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "linear"
             }}
           />
           <motion.div
             className="absolute top-12 right-22 w-20 h-20 rounded-full bg-gradient-radial from-yellow-200/40 via-orange-300/25 to-transparent"
             animate={backgroundAnimationsEnabled ? {
               scale: [0.9, 1.05, 0.9],
               opacity: [0.7, 0.9, 0.7]
             } : {}}
             transition={{
               duration: 8,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "easeInOut"
             }}
           />
           
           {/* Jupiter */}
           <motion.div
             className="absolute bottom-32 left-16 w-16 h-16 rounded-full bg-gradient-radial from-orange-600/25 via-yellow-700/15 to-brown-800/10"
             animate={backgroundAnimationsEnabled ? {
               x: [0, 30, 0],
               y: [0, -15, 0],
               rotate: [0, 360]
             } : {}}
             transition={{
               duration: 45,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "linear"
             }}
           />
           
           {/* Vénus */}
           <motion.div
             className="absolute top-1/2 left-1/4 w-10 h-10 rounded-full bg-gradient-radial from-yellow-200/30 via-orange-200/20 to-transparent"
             animate={backgroundAnimationsEnabled ? {
               x: [0, 50, 100, 50, 0],
               y: [0, -20, 0, 20, 0],
               opacity: [0.6, 0.8, 0.6, 0.8, 0.6]
             } : {}}
             transition={{
               duration: 35,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "easeInOut"
             }}
           />
           
           {/* Mars */}
           <motion.div
             className="absolute bottom-1/4 right-1/3 w-8 h-8 rounded-full bg-gradient-radial from-red-400/25 via-orange-500/15 to-transparent"
             animate={backgroundAnimationsEnabled ? {
               x: [0, -40, 0],
               y: [0, 25, 0],
               rotate: [0, -360]
             } : {}}
             transition={{
               duration: 55,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "linear"
             }}
           />
           
           {/* Saturne avec anneaux */}
           <motion.div
             className="absolute top-1/3 right-1/2 w-12 h-12 rounded-full bg-gradient-radial from-yellow-300/20 via-orange-400/15 to-transparent"
             animate={backgroundAnimationsEnabled ? {
               x: [0, -60, 0],
               y: [0, 30, 0],
               rotate: [0, 360]
             } : {}}
             transition={{
               duration: 65,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "linear"
             }}
           />
           {/* Anneaux de Saturne */}
           <motion.div
             className="absolute top-1/3 right-1/2 w-20 h-20 rounded-full border border-gray-400/10"
             style={{
               borderWidth: '1px',
               borderStyle: 'solid',
               borderColor: 'rgba(156, 163, 175, 0.1)'
             }}
             animate={backgroundAnimationsEnabled ? {
               x: [0, -60, 0],
               y: [0, 30, 0],
               rotate: [0, 360]
             } : {}}
             transition={{
               duration: 65,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "linear"
             }}
           />
           
           {/* Terre */}
           <motion.div
             className="absolute bottom-1/2 left-1/3 w-9 h-9 rounded-full bg-gradient-radial from-blue-400/25 via-green-500/15 to-blue-600/10"
             animate={backgroundAnimationsEnabled ? {
               x: [0, 70, 0],
               y: [0, -35, 0],
               rotate: [0, 360]
             } : {}}
             transition={{
               duration: 40,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "linear"
             }}
           />
           
           {/* Neptune */}
           <motion.div
             className="absolute top-3/4 left-1/2 w-7 h-7 rounded-full bg-gradient-radial from-blue-500/20 via-cyan-600/15 to-transparent"
             animate={backgroundAnimationsEnabled ? {
               x: [0, -80, 0],
               y: [0, -40, 0],
               rotate: [0, -360]
             } : {}}
             transition={{
               duration: 75,
               repeat: backgroundAnimationsEnabled ? Infinity : 0,
               ease: "linear"
             }}
           />
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Carte de connexion avec effet glassmorphism */}
            <motion.div
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* En-tête avec icône animée */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 border border-gray-700 rounded-full mb-4 mx-auto"
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.1
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <RiAdminLine className="w-8 h-8 text-gray-300" />
                </motion.div>
                <motion.h1
                  className="text-3xl font-bold text-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Admin Portal
                </motion.h1>
                <motion.p
                  className="text-gray-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  Accédez à votre espace d'administration
                </motion.p>
              </motion.div>

              {/* Formulaire de connexion */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champ Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    <FiMail className="inline w-4 h-4 mr-2" />
                    Email
                  </label>
                  <motion.div
                    className="relative"
                    variants={inputVariants}
                    animate={focusedInput === 'email' ? 'focus' : 'blur'}
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:border-gray-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="admin@example.com"
                      onFocus={() => {
                        setFocusedInput('email');
                        setBackgroundAnimationsEnabled(false);
                      }}
                      onBlur={() => {
                        setFocusedInput(null);
                        setBackgroundAnimationsEnabled(true);
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gray-600/20 opacity-0 pointer-events-none"
                      animate={{
                        opacity: focusedInput === 'email' ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.div>

                {/* Champ Mot de passe */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    <FiLock className="inline w-4 h-4 mr-2" />
                    Mot de passe
                  </label>
                  <motion.div
                    className="relative"
                    variants={inputVariants}
                    animate={focusedInput === 'password' ? 'focus' : 'blur'}
                  >
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:border-gray-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="••••••••"
                      onFocus={() => {
                        setFocusedInput('password');
                        setBackgroundAnimationsEnabled(false);
                      }}
                      onBlur={() => {
                        setFocusedInput(null);
                        setBackgroundAnimationsEnabled(true);
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gray-600/20 opacity-0 pointer-events-none"
                      animate={{
                        opacity: focusedInput === 'password' ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.div>

                {/* Message d'erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="flex items-center space-x-2 text-gray-300 bg-gray-800/20 border border-gray-700/30 rounded-lg p-3"
                    >
                      <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton de connexion */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={!isLoading ? { 
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
                    } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        <FiLogIn className="w-5 h-5" />
                        <span>Se connecter</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Indicateurs de sécurité */}
              <motion.div
                className="mt-8 pt-6 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FiShield className="w-3 h-3" />
                    <span>Sécurisé</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <FiZap className="w-3 h-3" />
                    <span>Rapide</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-3 h-3" />
                    <span>Privé</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Footer avec informations */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              <p className="text-xs text-gray-500">
                © 2024 Portfolio Admin. Tous droits réservés.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Connexion sécurisée avec chiffrement de bout en bout
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
