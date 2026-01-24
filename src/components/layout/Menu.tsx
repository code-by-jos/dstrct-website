import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Menu as MenuIcon } from 'lucide-react';
import { MenuLink } from '@/components/layout/MenuLink';
import { Button } from '@/components/ui/Button';
import type { NavLink } from '@/constants/navigation';

interface MenuProps {
  items: NavLink[];
}

export function Menu({ items }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const mobileMenu = (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/20 z-100 transition-opacity duration-200 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Panel */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-101 transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className='absolute top-6 right-6'>
          <Button variant='icon' onPress={() => setIsOpen(false)} aria-label='Close menu' className='text-black hover:text-gray-600'>
            <X className='w-6 h-6' />
          </Button>
        </div>

        <nav className='flex flex-col p-8 pt-20 gap-6'>
          {items.map((link) => (
            <div key={link.to} onClick={() => setIsOpen(false)}>
              <MenuLink to={link.to} className='block'>
                {link.label}
              </MenuLink>
            </div>
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className='hidden md:flex items-center gap-8'>
        {items.map((item) => (
          <MenuLink key={item.to} to={item.to}>
            {item.label}
          </MenuLink>
        ))}
      </nav>

      {/* Mobile Hamburger Button */}
      <div className='md:hidden flex items-center'>
        <Button variant='icon' onPress={() => setIsOpen(!isOpen)} aria-label='Toggle menu' className='relative z-[9999]'>
          <MenuIcon className='w-6 h-6' />
        </Button>
      </div>

      {/* Mobile Menu - Rendered via Portal */}
      {isMounted && createPortal(mobileMenu, document.body)}
    </>
  );
}
