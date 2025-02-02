import { useTheme } from 'next-themes';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'
    }`}>
      {children}
    </div>
  );
} 