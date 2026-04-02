import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { authOptions } from '../api/auth/[...nextauth]';
import { loginSchema } from '@/utils/schemas';
import { FiMail, FiLock, FiLogIn, FiUser, FiShield, FiZap, FiAlertCircle, FiArrowRight, FiLoader } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';

const FloatingParticles = ({ animationsEnabled }: { animationsEnabled: boolean }) => {
  const particles = Array.from({ length: 25 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-500/10 rounded-full"
          initial={{ x: Math.random() * 1920, y: Math.random() * 1080, opacity: Math.random() * 0.3 }}
          animate={animationsEnabled ? { y: [null, Math.random() * 1080], x: [null, Math.random() * 1920], opacity: [0.1, 0.4, 0.1] } : {}}
          transition={{ duration: Math.random() * 30 + 20, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
};

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundAnimationsEnabled, setBackgroundAnimationsEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) { setError(validation.error.errors[0].message); setIsLoading(false); return; }
    try {
      const response = await fetch('/api/auth/send-2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('2fa-email', email);
        sessionStorage.setItem('temp-password', password);
        router.push(`/admin/verify-2fa?email=${encodeURIComponent(email)}`);
      } else { setError(data.error || 'Identifiants invalides'); }
    } catch (e) { setError('Erreur de connexion'); } finally { setIsLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Connexion — Administration Portfolio</title>
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="min-h-screen bg-[#09090c] font-jakarta dark:text-zinc-200 relative overflow-hidden flex items-center justify-center p-6">
        <FloatingParticles animationsEnabled={backgroundAnimationsEnabled} />
        
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-500/10 blur-[120px] rounded-full" />
           <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] bg-indigo-500/10 blur-[100px] rounded-full" />
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-lg relative z-10">
           <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[48px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 blur-3xl -mr-20 -mt-20 group-hover:bg-primary-500/10 transition-colors" />
              
              {/* Logo/Icon */}
              <div className="flex flex-col items-center mb-12">
                 <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="w-20 h-20 bg-primary-500/10 border border-primary-500/20 rounded-[28px] flex items-center justify-center text-primary-500 shadow-premium mb-6">
                    <RiAdminLine size={36} />
                 </motion.div>
                 <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-3">
                       <span className="w-5 h-[1px] bg-primary-500/30" />
                       <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Secure Access</span>
                       <span className="w-5 h-[1px] bg-primary-500/30" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tighter">Admin Portal</h1>
                    <p className="text-zinc-500 text-sm font-medium">Authentification à deux facteurs active</p>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2 group/field">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 group-focus-within/field:text-primary-400 transition-colors">Identifiant Email</label>
                       <div className="relative">
                          <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/field:text-primary-500 transition-colors" size={18} />
                          <input type="email" name="email" required className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-bold placeholder:text-zinc-700" placeholder="admin@domain.com" onFocus={() => setBackgroundAnimationsEnabled(false)} onBlur={() => setBackgroundAnimationsEnabled(true)} />
                       </div>
                    </div>

                    <div className="space-y-2 group/field">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 group-focus-within/field:text-primary-400 transition-colors">Mot de passe</label>
                       <div className="relative">
                          <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/field:text-primary-500 transition-colors" size={18} />
                          <input type="password" name="password" required className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all font-bold placeholder:text-zinc-700" placeholder="••••••••" onFocus={() => setBackgroundAnimationsEnabled(false)} onBlur={() => setBackgroundAnimationsEnabled(true)} />
                       </div>
                    </div>
                 </div>

                 <AnimatePresence>
                   {error && (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl">
                        <FiAlertCircle size={18} className="shrink-0" />
                        <span className="text-xs font-bold leading-tight">{error}</span>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <button type="submit" disabled={isLoading} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
                    {isLoading ? <FiLoader className="animate-spin" /> : (
                       <>
                          <FiLogIn size={18} />
                          Continuer
                          <FiArrowRight size={18} className="ml-auto opacity-50" />
                       </>
                    )}
                 </button>
              </form>

              {/* Trust Badges */}
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-center gap-8">
                 {[ { i: FiShield, l: 'Secure' }, { i: FiZap, l: 'Fast' }, { i: FiUser, l: 'Private' } ].map(badge => (
                    <div key={badge.l} className="flex items-center gap-2 text-zinc-700">
                       <badge.i size={12} />
                       <span className="text-[9px] font-black uppercase tracking-widest">{badge.l}</span>
                    </div>
                 ))}
              </div>
           </div>

           <p className="text-center mt-8 text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
              © 2024 Administration Système · Chiffrement AES-256
           </p>
        </motion.div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) return { redirect: { destination: '/admin', permanent: false } };
  return { props: {} };
};
