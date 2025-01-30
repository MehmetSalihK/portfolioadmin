import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-purple-500/30 dark:from-primary-900/30 dark:to-purple-900/30" />
      
      {/* Animated circles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 dark:opacity-30"
          animate={{
            scale: [1, 2, 2, 1, 1],
            opacity: [0.5, 0.2, 0.8, 0.3, 0.5],
            x: [0, 100, -100, -200, 0],
            y: [0, -100, 100, -100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 2,
          }}
          style={{
            background: `radial-gradient(circle, ${
              i === 0 ? '#6366f1' : i === 1 ? '#8b5cf6' : '#ec4899'
            }, transparent)`,
            width: '40rem',
            height: '40rem',
            left: `${i * 30}%`,
            top: `${i * 20}%`,
          }}
        />
      ))}

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px)] bg-[size:14px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
}
