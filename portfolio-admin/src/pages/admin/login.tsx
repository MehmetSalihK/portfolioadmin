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

// Floating ambient particles
const FloatingParticles = ({ animationsEnabled }: { animationsEnabled: boolean }) => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-indigo-500/10 rounded-full"
          initial={{ x: Math.random() * 1200, y: Math.random() * 800, opacity: Math.random() * 0.3 + 0.1 }}
          animate={animationsEnabled ? { y: [null, Math.random() * 800], x: [null, Math.random() * 1200], opacity: [null, Math.random() * 0.4 + 0.1] } : {}}
          transition={{ duration: Math.random() * 20 + 10, repeat: animationsEnabled ? Infinity : 0, repeatType: "reverse", ease: "linear" }}
        />
      ))}
    </div>
  );
};

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [backgroundAnimationsEnabled, setBackgroundAnimationsEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('2fa-email', email);
        sessionStorage.setItem('temp-password', password);
        router.push(`/admin/verify-2fa?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du code de vérification');
      }
    } catch (error) {
      setError('La connexion a échoué. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login - Portfolio</title>
        <meta name="theme-color" content="#0a0a0a" />
      </Head>

      <div className="min-h-screen bg-[#09090f] text-zinc-200 relative overflow-hidden">
        {/* Ambient particles */}
        <FloatingParticles animationsEnabled={backgroundAnimationsEnabled} />

        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Stars */}
          {Array.from({ length: 120 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.6 + 0.1 }}
              animate={backgroundAnimationsEnabled ? { opacity: [0.1, 0.8, 0.1] } : {}}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
            />
          ))}

          {/* Nebula orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"
            animate={backgroundAnimationsEnabled ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : {}}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl"
            animate={backgroundAnimationsEnabled ? { scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.4, 0.2] } : {}}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"
            animate={backgroundAnimationsEnabled ? { scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] } : {}}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
            className="w-full max-w-md"
          >
            {/* Card */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-5 mx-auto"
                  whileHover={{ rotate: 8, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <RiAdminLine className="w-8 h-8 text-indigo-400" />
                </motion.div>

                <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                  <span className="w-6 h-[1px] bg-indigo-500" />
                  Espace Admin
                  <span className="w-6 h-[1px] bg-indigo-500" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
                <p className="text-zinc-500 mt-2 text-sm font-medium">
                  Authentification sécurisée 2FA
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <label htmlFor="email" className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors w-4 h-4" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-white placeholder-zinc-600 transition-all font-medium"
                      placeholder="admin@example.com"
                      onFocus={() => { setFocusedInput('email'); setBackgroundAnimationsEnabled(false); }}
                      onBlur={() => { setFocusedInput(null); setBackgroundAnimationsEnabled(true); }}
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <label htmlFor="password" className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors w-4 h-4" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-white placeholder-zinc-600 transition-all font-medium"
                      placeholder="••••••••"
                      onFocus={() => { setFocusedInput('password'); setBackgroundAnimationsEnabled(false); }}
                      onBlur={() => { setFocusedInput(null); setBackgroundAnimationsEnabled(true); }}
                    />
                  </div>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="flex items-center gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5"
                    >
                      <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-bold">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.97 } : {}}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 border border-indigo-500"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiLogIn className="w-4 h-4" />
                      <span>Se connecter</span>
                      <FiArrowRight className="w-4 h-4 ml-auto" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Security badges */}
              <motion.div
                className="mt-7 pt-5 border-t border-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-6">
                  {[
                    { icon: FiShield, label: 'Sécurisé' },
                    { icon: FiZap, label: 'Chiffré' },
                    { icon: FiUser, label: 'Privé' }
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-zinc-700">
                      <Icon className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.p
              className="text-center text-[10px] text-zinc-700 font-medium mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              © 2024 Portfolio Admin · Connexion chiffrée de bout en bout
            </motion.p>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    return { redirect: { destination: '/admin', permanent: false } };
  }
  return { props: {} };
};
