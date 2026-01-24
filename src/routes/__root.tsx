import { HeadContent, Outlet, Scripts, createRootRoute, useMatches } from '@tanstack/react-router';

import appCss from '../styles.css?url';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/components/ui/Link';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'DSTRCT',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  const matches = useMatches();
  const isHomePage = matches[matches.length - 1]?.routeId === '/';

  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body className='flex flex-col min-h-screen overflow-x-hidden'>
        <Header appearOnScroll={isHomePage} />
        {!isHomePage && <div className='h-20' />}
        <main className='flex-1'>
          <Outlet />
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-8'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='mt-4 text-gray-600'>Page not found</p>
      <Link to='/' className='mt-8 underline'>
        Go home
      </Link>
    </div>
  );
}
