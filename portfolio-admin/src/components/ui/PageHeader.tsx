import { motion } from 'framer-motion';
import Head from 'next/head';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <>
      <Head>
        <title>{title} - Portfolio</title>
        <meta name="description" content={description || subtitle || `${title} - Portfolio Professionnel`} />
      </Head>

      <div className="relative pt-24 pb-8 sm:pt-32 sm:pb-12 overflow-hidden">
        
        <div className="container-fluid relative z-10 text-center">
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6 text-balance"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-pretty"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </>
  );
}
