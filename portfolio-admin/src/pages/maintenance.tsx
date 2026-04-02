import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiMail, FiLinkedin, FiGithub, FiZap, FiActivity, FiTerminal, FiShield, FiCpu } from 'react-icons/fi';
import { GetStaticProps } from 'next';

const FloatingParticles = () => {
  const particles = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-500/10 rounded-full"
          initial={{ x: Math.random() * 1920, y: Math.random() * 1080, opacity: Math.random() * 0.3 }}
          animate={{ x: [null, Math.random() * 1920], y: [null, Math.random() * 1080], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: Math.random() * 30 + 20, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
};

export default function Maintenance() {
  return (
    <div className="min-h-screen dark:bg-[#09090c] bg-white font-jakarta flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
      <Head>
        <title>Maintenance — Portfolio Operational Status</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#09090b" />
      </Head>

      <FloatingParticles />

      {/* Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary-600/10 blur-[130px] rounded-full" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 18, repeat: Infinity }} className="absolute -bottom-[10%] -left-[5%] w-[50%] h-[50%] bg-indigo-600/5 blur-[110px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[64px] p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative group overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 blur-3xl -mr-20 -mt-20 group-hover:bg-primary-500/10 transition-colors" />
           
           {/* Superior Status Badge */}
           <div className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-5 py-2 rounded-2xl mb-12 shadow-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-400">Offline Optimized</span>
           </div>

           {/* Central Core Icon */}
           <div className="flex justify-center mb-12">
              <motion.div 
                whileHover={{ rotate: 90 }}
                className="w-32 h-32 bg-primary-500/10 border border-primary-500/20 rounded-[40px] flex items-center justify-center text-primary-500 shadow-premium relative transition-transform duration-700"
              >
                 <FiCpu className="w-14 h-14" />
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 p-4 opacity-30">
                    <FiSettings className="w-6 h-6 absolute top-2 right-2" />
                 </motion.div>
              </motion.div>
           </div>

           <div className="space-y-4 mb-16">
              <div className="flex items-center justify-center gap-4">
                 <span className="w-8 h-[1px] bg-primary-500/30" />
                 <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary-500">Node Maintenance</span>
                 <span className="w-8 h-[1px] bg-primary-500/30" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-black dark:text-white text-slate-900 tracking-tighter leading-none">
                 Update <span className="text-primary-500 underline decoration-primary-500/20 underline-offset-8 decoration-4">Stream</span>
              </h1>
              <p className="text-lg dark:text-slate-400 text-slate-500 font-medium max-w-md mx-auto leading-relaxed pt-4 italic">
                 "Architecture en cours de synchronisation. Nous optimisons les flux pour une expérience optimale."
              </p>
           </div>

           {/* Contact Hub */}
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:contact@mehmetsalihk.fr"
                className="w-full sm:w-auto px-10 py-5 bg-primary-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3 transition-colors active:bg-primary-600"
              >
                <FiMail size={18} /> Direct Pipeline
              </motion.a>
              
              <div className="flex items-center gap-4">
                 {[
                   { icon: FiLinkedin, href: 'https://linkedin.com/in/mehmetsalihk', label: 'LinkedIn' },
                   { icon: FiGithub, href: 'https://github.com/MehmetSalihK', label: 'GitHub' }
                 ].map((social) => (
                    <motion.a 
                      key={social.label}
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      target="_blank" rel="noopener noreferrer" href={social.href}
                      className="w-14 h-14 bg-slate-100 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-[22px] flex items-center justify-center dark:text-slate-400 text-slate-600 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm"
                      title={social.label}
                    >
                      <social.icon size={20} />
                    </motion.a>
                 ))}
              </div>
           </div>

           {/* Dynamic Status Badges */}
           <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-8 px-4 opacity-50 group-hover:opacity-100 transition-opacity">
              {[
                { i: FiShield, l: 'Secure' },
                { i: FiZap, l: 'Optimizing' },
                { i: FiActivity, l: 'Alive' },
                { i: FiTerminal, l: 'V2.2 HQ' }
              ].map(badge => (
                 <div key={badge.l} className="flex items-center gap-2 text-slate-500">
                    <badge.i className="text-primary-500" size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{badge.l}</span>
                 </div>
              ))}
           </div>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[10px] font-black dark:text-slate-600 text-slate-400 uppercase tracking-[0.4em]">
             © 2024 PORTFOLIO CORE — ALL SYSTEMS OPERATIONAL
           </p>
        </div>
      </motion.div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};