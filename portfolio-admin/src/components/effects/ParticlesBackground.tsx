import { useCallback, useEffect, useState } from 'react';
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from 'tsparticles-engine';
import { useTheme } from 'next-themes';

export default function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div 
      className={`fixed inset-0 -z-10 transition-colors duration-300 ${
        currentTheme === 'dark' 
          ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-black'
          : 'bg-gradient-to-b from-gray-50 via-gray-100 to-white'
      }`}
      style={{
        backgroundImage: currentTheme === 'dark'
          ? `
            radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 100%),
            linear-gradient(to bottom, #111827, #000000)
          `
          : `
            radial-gradient(circle at center, rgba(0,0,0,0.03) 0%, transparent 100%),
            linear-gradient(to bottom, #f9fafb, #ffffff)
          `
      }}
    />
  );
}
