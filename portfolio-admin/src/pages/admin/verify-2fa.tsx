import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

interface FloatingParticlesProps {
  animationsEnabled: boolean;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ animationsEnabled }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={animationsEnabled ? {
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
          } : {}}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const inputVariants = {
  focused: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    transition: { duration: 0.2 }
  },
  unfocused: {
    scale: 1,
    boxShadow: "0 0 0 0px rgba(59, 130, 246, 0)",
    transition: { duration: 0.2 }
  }
};

export default function Verify2FA() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [backgroundAnimationsEnabled, setBackgroundAnimationsEnabled] = useState(true);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes
  const router = useRouter();

  useEffect(() => {
    // Récupérer l'email depuis les paramètres de l'URL ou le sessionStorage
    const emailFromQuery = router.query.email as string;
    const emailFromStorage = sessionStorage.getItem('2fa-email');
    
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      sessionStorage.setItem('2fa-email', emailFromQuery);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // Rediriger vers la page de login si pas d'email
      router.push('/admin/login');
      return;
    }

    // Timer pour le compte à rebours
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Le code a expiré. Veuillez vous reconnecter.');
          router.push('/admin/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (code.length !== 6) {
      setError('Le code doit contenir exactement 6 chiffres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Authentification réussie!');
        sessionStorage.removeItem('2fa-email');
        
        // Utiliser NextAuth pour créer la session
        const result = await signIn('credentials', {
          email,
          password: 'verified-2fa', // Token spécial pour indiquer que 2FA est vérifié
          redirect: false,
        });

        if (result?.ok) {
          router.push('/admin');
        } else {
          setError('Erreur lors de la création de la session');
        }
      } else {
        setError(data.error || 'Code invalide');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const password = sessionStorage.getItem('temp-password');
      if (!password) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/auth/send-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast.success('Nouveau code envoyé!');
        setTimeLeft(600); // Reset timer
        setCode('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  return (
    <>
      <Head>
        <title>Vérification 2FA - Portfolio Admin</title>
        <meta name="description" content="Vérification en deux étapes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <FloatingParticles animationsEnabled={backgroundAnimationsEnabled} />
        
        {/* Galactic Background */}
        <div className="absolute inset-0">
          {/* Twinkling Stars */}
          {[...Array(200)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={backgroundAnimationsEnabled ? {
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1.2, 0.5],
              } : {}}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Nebulae Effects */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)'
            }}
            animate={backgroundAnimationsEnabled ? {
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            } : {}}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl font-bold text-white text-center mb-2"
              >
                Vérification 2FA
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-gray-300 text-center mb-6"
              >
                Un code de vérification a été envoyé à<br />
                <span className="font-semibold text-blue-300">contact@mehmetsalihk.fr</span>
              </motion.p>

              <div className="text-center mb-6">
                <div className="text-sm text-gray-400 mb-2">
                  Temps restant: <span className="font-mono text-yellow-400">{formatTime(timeLeft)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Connexion pour: <span className="text-blue-300">{email}</span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  variants={inputVariants}
                  animate={focusedInput === 'code' ? 'focused' : 'unfocused'}
                >
                  <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                    Code de vérification
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    onFocus={() => {
                      setFocusedInput('code');
                      setBackgroundAnimationsEnabled(false);
                    }}
                    onBlur={() => {
                      setFocusedInput(null);
                      setBackgroundAnimationsEnabled(true);
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    Saisissez le code à 6 chiffres
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Vérification...
                    </div>
                  ) : (
                    'Vérifier le code'
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-blue-400 hover:text-blue-300 text-sm underline disabled:opacity-50"
                >
                  Renvoyer le code
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    sessionStorage.removeItem('2fa-email');
                    sessionStorage.removeItem('temp-password');
                    router.push('/admin/login');
                  }}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}