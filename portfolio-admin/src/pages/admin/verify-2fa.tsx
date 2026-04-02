import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FiShield, FiClock, FiMail, FiCheck, FiRefreshCw, FiArrowLeft, FiLoader, FiZap, FiLock } from 'react-icons/fi';

const FloatingParticles = ({ animationsEnabled }: { animationsEnabled: boolean }) => {
  const particles = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-500/10 rounded-full"
          initial={{ x: Math.random() * 1920, y: Math.random() * 1080, opacity: Math.random() * 0.3 }}
          animate={animationsEnabled ? { y: [null, -100, 1080], x: [null, Math.random() * 1920], opacity: [0.1, 0.4, 0.1] } : {}}
          transition={{ duration: Math.random() * 20 + 15, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
};

export default function Verify2FA() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const router = useRouter();

  useEffect(() => {
    const emailFromQuery = router.query.email as string;
    const emailFromStorage = sessionStorage.getItem('2fa-email');
    if (emailFromQuery) { setEmail(emailFromQuery); sessionStorage.setItem('2fa-email', emailFromQuery); } else if (emailFromStorage) { setEmail(emailFromStorage); } else { router.push('/admin/login'); return; }
    const timer = setInterval(() => { setTimeLeft(p => { if (p <= 1) { clearInterval(timer); toast.error('Code expiré'); router.push('/admin/login'); return 0; } return p - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (s: number) => { const m = Math.floor(s / 60); const rs = s % 60; return `${m}:${rs.toString().padStart(2, '0')}`; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { setError('6 chiffres requis'); return; }
    setError(''); setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      if (res.ok) {
        toast.success('Authentifié !');
        sessionStorage.removeItem('2fa-email');
        const resAuth = await signIn('credentials', { email, password: 'verified-2fa', redirect: false });
        if (resAuth?.ok) router.push('/admin'); else setError('Session error');
      } else { const d = await res.json(); setError(d.error || 'Code invalide'); }
    } catch (e) { setError('Erreur réseau'); } finally { setIsLoading(false); }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const p = sessionStorage.getItem('temp-password');
      if (!p) { router.push('/admin/login'); return; }
      const res = await fetch('/api/auth/send-2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: p }) });
      if (res.ok) { toast.success('Code renvoyé'); setTimeLeft(600); setCode(''); } else { toast.error('Erreur'); }
    } catch (e) { toast.error('Erreur'); } finally { setIsLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Vérification 2FA — Administration</title>
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="min-h-screen bg-[#09090c] font-jakarta dark:text-zinc-200 relative overflow-hidden flex items-center justify-center p-6">
        <FloatingParticles animationsEnabled={true} />
        
        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity }} className="absolute h-[80%] w-[80%] bg-indigo-600/10 blur-[150px] rounded-full -top-[40%] -left-[40%]" />
           <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 12, repeat: Infinity }} className="absolute h-[60%] w-[60%] bg-primary-600/10 blur-[120px] rounded-full -bottom-[30%] -right-[30%]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-lg relative z-10">
           <div className="bg-white/5 backdrop-blur-[60px] border border-white/10 rounded-[48px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors" />

              <div className="flex flex-col items-center text-center mb-10">
                 <motion.div whileHover={{ rotate: 10, scale: 1.05 }} className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-8">
                    <FiShield size={36} />
                 </motion.div>
                 <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                       <span className="w-4 h-[1px] bg-emerald-500/30" />
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Multi-Factor</span>
                       <span className="w-4 h-[1px] bg-emerald-500/30" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tighter">Double Sécurité</h1>
                    <p className="text-zinc-500 text-sm font-medium px-4">Saisissez le code de vérification envoyé à votre adresse.</p>
                 </div>
              </div>

              <div className="flex items-center justify-center gap-6 mb-10">
                 <div className="grow bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 flex items-center gap-3">
                    <FiClock size={16} className="text-primary-500" />
                    <span className="text-xs font-black text-white tabular-nums">{formatTime(timeLeft)} <span className="text-zinc-500 uppercase ml-1 opacity-50 tracking-widest text-[9px]">restant</span></span>
                 </div>
                 <div className="grow bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 flex items-center gap-3 overflow-hidden">
                    <FiMail size={16} className="text-indigo-400 shrink-0" />
                    <span className="text-[10px] font-bold text-zinc-400 truncate">{email}</span>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-2 group/field text-center">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-focus-within/field:text-primary-400 transition-colors">Vérification Code</label>
                    <div className="relative">
                       <FiZap className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700/50" />
                       <input type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/[0.03] border border-white/10 rounded-[28px] py-6 text-center text-3xl font-black text-white tracking-[0.6em] outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500/50 transition-all placeholder:text-zinc-800" placeholder="000000" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-600 mt-3 uppercase tracking-widest">Code à 6 chiffres requis</p>
                 </div>

                 <AnimatePresence>
                   {error && (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-center text-xs font-bold leading-tight">
                        {error}
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="space-y-4">
                    <button type="submit" disabled={isLoading || code.length !== 6} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-40">
                       {isLoading ? <FiLoader className="animate-spin" /> : (
                          <>
                             <FiCheck size={20} />
                             Confirmer l'identité
                          </>
                       )}
                    </button>
                    <button type="button" onClick={handleResendCode} className="w-full py-4 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest flex items-center justify-center gap-3 transition-colors border border-transparent hover:border-white/5 rounded-2xl">
                       <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                       Renvoyer un nouveau code
                    </button>
                 </div>
              </form>

              <div className="mt-10 pt-8 border-t border-white/5">
                 <button onClick={() => router.push('/admin/login')} className="text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-colors mx-auto group">
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Retour à la connexion
                 </button>
              </div>
           </div>
        </motion.div>
      </div>
    </>
  );
}