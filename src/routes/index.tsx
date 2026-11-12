import { createFileRoute } from '@tanstack/react-router';
import { MenuLink } from '@/components/layout/MenuLink';
import { navLinks } from '@/constants/navigation';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Hero Video Section - Fixed */}
      <section className='fixed top-0 left-0 w-full h-screen overflow-hidden z-0'>
        <video
          autoPlay
          loop
          muted
          playsInline
          poster='/home-video-poster.webp'
          preload='metadata'
          className='w-full h-full object-cover'
          style={{ filter: 'brightness(0.5) saturate(0)' }}
        >
          <source src='/home-video.mp4' type='video/mp4' />
        </video>

        <div className='absolute inset-0 bg-white pointer-events-none animate-hero-background' />

        <div className='absolute inset-0 flex flex-col items-center justify-center px-4'>
          <img src='/logo-white.png' alt='DSTRCT' className='h-20 md:h-28 w-auto mb-12 md:mb-16' />

          <nav aria-label='Main navigation' className='flex flex-col md:flex-row gap-2 md:gap-6 text-center'>
            {navLinks.map((link) => (
              <MenuLink key={link.to} to={link.to} className='text-white text-xl md:text-2xl py-3 px-4 hover:text-black'>
                {link.label}
              </MenuLink>
            ))}
          </nav>
        </div>
      </section>

      {/* Spacer to push content down */}
      <div className='h-screen' />
    </>
  );
}
