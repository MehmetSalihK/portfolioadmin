import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { authOptions } from '../api/auth/[...nextauth]';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';

const inputVariants = {
  focus: { scale: 1.02, transition: { duration: 0.2 } },
  blur: { scale: 1, transition: { duration: 0.2 } }
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0, transition: { type: "spring", duration: 0.8 } }
};

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      console.log('Tentative de connexion...');
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/admin'  // Modification ici pour rediriger vers /admin
      });

      if (result?.ok) {
        console.log('Connexion réussie, redirection...');
        router.push('/admin');  // Modification ici pour rediriger vers /admin
      } else if (result?.error) {
        console.error('Erreur de connexion:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('La connexion a échoué. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log
    };
  
    const shouldFilter = (message: any) => {
      if (typeof message !== 'string') return false;
      return (
        message.includes('chrome-extension://') ||
        message.includes('Denying load of') ||
        message.includes('bis_skin_checked') ||
        message.includes('Failed to load resource') ||
        message.includes('React DevTools') ||
        message.includes('[HMR]') ||
        message.includes('Warning: Extra attributes')
      );
    };
  
    console.error = (...args: any[]) => {
      if (!args.some(shouldFilter)) {
        originalConsole.error.apply(console, args);
      }
    };
  
    console.warn = (...args: any[]) => {
      if (!args.some(shouldFilter)) {
        originalConsole.warn.apply(console, args);
      }
    };
  
    console.log = (...args: any[]) => {
      if (!args.some(shouldFilter)) {
        originalConsole.log.apply(console, args);
      }
    };
  
    return () => {
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.log = originalConsole.log;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Admin Login - Portfolio</title>
        <meta name="theme-color" content="#1a1a1a" />
      </Head>

      <div className="min-h-screen bg-[#1a1a1a] text-gray-200">
        <div className="container mx-auto px-4 h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#242424] rounded-2xl p-8 shadow-xl border border-gray-800 relative overflow-hidden" suppressHydrationWarning>
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-purple-600/10 animate-gradient" />
              
              <div className="relative space-y-6">
                <div className="text-center">
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    className="relative"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                      <RiAdminLine className="w-10 h-10 text-white" />
                    </div>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="absolute -right-1 -top-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      <FiUser className="w-3 h-3 text-white" />
                    </motion.div>
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    Portfolio Admin
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-400 text-sm"
                  >
                    Sign in to manage your content
                  </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 flex items-center space-x-2">
                        <FiMail className="w-4 h-4" />
                        <span>Email</span>
                      </label>
                      <motion.div
                        variants={inputVariants}
                        animate={focusedInput === 'email' ? 'focus' : 'blur'}
                        className="relative"
                      >
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          onFocus={() => setFocusedInput('email')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </motion.div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 flex items-center space-x-2">
                        <FiLock className="w-4 h-4" />
                        <span>Password</span>
                      </label>
                      <motion.div
                        variants={inputVariants}
                        animate={focusedInput === 'password' ? 'focus' : 'blur'}
                        className="relative"
                      >
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          onFocus={() => setFocusedInput('password')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                          placeholder="••••••••"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-900/30 border border-red-800/50 rounded-xl text-red-200 text-sm flex items-center space-x-2"
                    >
                      <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#242424] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <motion.span
                        animate={{ rotate: loading ? 360 : 0 }}
                        transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FiUser className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                        )}
                      </motion.span>
                      <span>Sign in</span>
                    </span>
                  </motion.button>
                </form>
              </div>
            </div>
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
