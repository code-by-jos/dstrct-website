import { useState, useEffect } from 'react';
import { Link } from '@/components/ui/Link';
import { Container } from '@/components/ui/Container';
import { Menu } from '@/components/layout/Menu';
import { navLinks } from '@/constants/navigation';

interface HeaderProps {
  appearOnScroll?: boolean;
}

export function Header({ appearOnScroll = false }: HeaderProps) {
  const [showHeader, setShowHeader] = useState(!appearOnScroll);

  useEffect(() => {
    if (!appearOnScroll) {
      setShowHeader(true);
      return;
    }

    setShowHeader(window.scrollY > 100);

    const handleScroll = () => {
      setShowHeader(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [appearOnScroll]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <Container>
        <div className='flex items-center justify-between h-20'>
          <Link to='/' className='shrink-0 hover:opacity-80 transition-opacity'>
            <img src='/logo.png' alt='DSTRCT' className='h-6 w-auto' />
          </Link>

          <div className='flex items-center'>
            <Menu items={navLinks} />
          </div>
        </div>
      </Container>
    </header>
  );
}
