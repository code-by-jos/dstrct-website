import { INSTAGRAM_HANDLE } from '@/constants/navigation';

export const SITE_URL = 'https://dstrct-mgmt.com';
export const SITE_NAME = 'DSTRCT';
export const HOME_TITLE = 'DSTRCT Management | International Model Agency in Amsterdam';
export const HOME_DESCRIPTION =
  'DSTRCT is an international model agency based in Amsterdam, offering personal management and long-term career development for models. Discover our talent.';

interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
}

const pageMetadata: Record<string, PageMetadata> = {
  '/': { title: HOME_TITLE, description: HOME_DESCRIPTION },
  '/models': {
    title: 'Models | DSTRCT',
    description:
      'Discover the DSTRCT model board. Explore portfolios and meet the talent represented by our International model agency in Amsterdam.',
  },
  '/about': {
    title: 'About Our Model Agency | DSTRCT',
    description:
      'Meet DSTRCT, a boutique model agency in Amsterdam focused on personal management, model development, and building long-term careers.',
  },
  '/contact': {
    title: 'Contact & Model Bookings | DSTRCT',
    description:
      'Contact DSTRCT in Amsterdam for model bookings, representation, and collaborations. Visits to our boutique model agency are by appointment.',
  },
  '/apply': {
    title: 'Become a Model | DSTRCT',
    description:
      'Interested in becoming a model? Apply to DSTRCT, an international model agency in Amsterdam offering personal guidance and talent development.',
  },
  '/news': {
    title: 'Model News, Editorials & Runway | DSTRCT',
    description: 'Explore runway appearances, editorials, and the latest updates from the models represented by DSTRCT in Amsterdam',
  },
  '/runway': {
    title: 'Runway News | DSTRCT',
    description: 'Discover the latest runway appearances and fashion show highlights from DSTRCT models.',
  },
  '/privacy': {
    title: 'Privacy policy | DSTRCT',
    description: 'Read the privacy policy to learn how we handle personal information and protect your privacy.',
  },
  '/terms': {
    title: 'Terms & Conditions | DSTRCT',
    description: 'Read the terms and conditions for DSTRCT model management.',
  },
};

export function normalizePath(path: string) {
  return path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
}

export function canonicalUrl(path: string) {
  const normalized = normalizePath(path);
  return `${SITE_URL}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

export function createPageMeta({ title, description, image = `${SITE_URL}/og-image.png`, imageAlt = HOME_TITLE, type = 'website' }: PageMetadata) {
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:image', content: image },
    { property: 'og:image:alt', content: imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: imageAlt },
  ];
}

export function getPageMeta(path: string) {
  return createPageMeta(pageMetadata[normalizePath(path)] ?? pageMetadata['/']);
}

export const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: 'DSTRCT-MGMT',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/brand-logo.png`,
      description: HOME_DESCRIPTION,
      address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
      sameAs: [`https://www.instagram.com/${INSTAGRAM_HANDLE}/`],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: 'DSTRCT-MGMT',
      url: `${SITE_URL}/`,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};
