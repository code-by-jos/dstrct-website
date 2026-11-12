import { Link } from '@/components/ui/Link';
import { Container } from '@/components/ui/Container';
import { InstagramLink } from '@/components/ui/InstagramLink';
import { navLinks, INSTAGRAM_HANDLE } from '@/constants/navigation';

export function Footer() {
  return (
    <footer className='relative z-10 bg-white border-t border-gray-200 py-12'>
      <div data-nosnippet=''>
        <Container>
          <div className='flex flex-col md:flex-row justify-between gap-8'>
            {/* Navigation Links */}
            <nav className='flex flex-col gap-2'>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} variant='footer'>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Legal Links */}
            <div className='flex flex-col gap-2'>
              <Link to='/privacy' variant='footer'>
                Privacy Policy
              </Link>
              <Link to='/terms' variant='footer'>
                Terms & conditions
              </Link>
            </div>

            {/* Instagram */}
            <div className='flex items-start'>
              <InstagramLink handle={INSTAGRAM_HANDLE} variant='footer' className='gap-2' />
            </div>
          </div>

          <div className='mt-8 text-center'>
            <p className='text-xs text-gray-400'>© {new Date().getFullYear()} DSTRCT. All rights reserved.</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
