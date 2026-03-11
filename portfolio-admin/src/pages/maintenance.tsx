import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiSettings, FiMail, FiLinkedin, FiGithub } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import connectDB from '@/lib/db';

export default function Maintenance() {
  return (
    <div className="min-h-screen dark:bg-[#09090f] bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <Head>
        <title>Maintenance - Portfolio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Ambient backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] dark:bg-indigo-600/10 bg-indigo-50/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] dark:bg-violet-600/8 bg-violet-50/40 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl dark:bg-zinc-900/60 bg-white dark:border-white/10 border-zinc-200 border shadow-2xl mb-8 relative">
          <FiSettings className="w-10 h-10 text-indigo-500 animate-[spin_4s_linear_infinite]" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-4 dark:border-[#09090f] border-white" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black dark:text-white text-zinc-900 tracking-tight mb-6 leading-tight">
          Maintenance en cours
        </h1>
        
        <p className="text-lg dark:text-zinc-400 text-zinc-600 font-medium mb-12 max-w-md mx-auto leading-relaxed">
          Je mets à jour mon portfolio pour vous offrir une meilleure expérience. 
          Le site sera de retour très prochainement.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <motion.a 
            whileHover={{ y: -3 }}
            href="mailto:contact@mehmetsalihk.fr"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20"
          >
            <FiMail className="w-4 h-4" />
            Me contacter
          </motion.a>
          
          <div className="flex items-center gap-2">
            <motion.a 
              whileHover={{ y: -3 }}
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.linkedin.com/in/mehmetsalihk"
              className="p-3 dark:bg-white/5 bg-zinc-100 dark:border-white/10 border-zinc-200 border rounded-xl dark:text-zinc-400 text-zinc-600 hover:text-indigo-500 transition-colors"
              title="LinkedIn"
            >
              <FiLinkedin className="w-5 h-5" />
            </motion.a>
            <motion.a 
              whileHover={{ y: -3 }}
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/MehmetSalihK"
              className="p-3 dark:bg-white/5 bg-zinc-100 dark:border-white/10 border-zinc-200 border rounded-xl dark:text-zinc-400 text-zinc-600 hover:text-indigo-500 transition-colors"
              title="GitHub"
            >
              <FiGithub className="w-5 h-5" />
            </motion.a>
          </div>
        </div>

        <div className="mt-16 pt-8 dark:border-white/5 border-zinc-100 border-t">
          <p className="text-xs font-bold dark:text-zinc-600 text-zinc-400 uppercase tracking-widest">
            © 2024 Mehmet Salih K.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const MaintenanceModel = (await import('@/models/Maintenance')).default;
    await connectDB();
    const status = await MaintenanceModel.findOne().lean();

    // If maintenance is NOT enabled, redirect to home
    if (!status || !(status as any).isEnabled) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch (error) {
    return {
      props: {},
    };
  }
};