import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryHistory, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Route as rootRoute } from '@/routes/__root';
import { Route as homeRoute } from '@/routes/index';
import { canonicalUrl, createPageMeta, getPageMeta, HOME_DESCRIPTION, HOME_TITLE, homeStructuredData, SITE_URL } from '@/utils/seo';

afterEach(() => vi.unstubAllEnvs());

async function loadPage(path = '/', environment = 'production') {
  vi.stubEnv('VITE_DEPLOY_ENVIRONMENT', environment);
  const root = rootRoute;
  const home = createRoute({ component: homeRoute.options.component, path: '/', getParentRoute: () => root });
  const models = createRoute({ path: '/models', getParentRoute: () => root, component: () => <h1>Models</h1> });
  const news = createRoute({ path: '/news/$slug', getParentRoute: () => root, component: () => <h1>News post</h1> });
  const router = createRouter({
    routeTree: root.addChildren([home, models, news]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return router;
}

describe('search metadata', () => {
  it('describes the homepage and uses an absolute social preview', () => {
    const meta = getPageMeta('/');
    expect(meta).toContainEqual({ title: HOME_TITLE });
    expect(meta).toContainEqual({ name: 'description', content: HOME_DESCRIPTION });
    expect(meta).toContainEqual({ property: 'og:image', content: `${SITE_URL}/og-image.png` });
    expect(meta).toContainEqual({ name: 'twitter:card', content: 'summary_large_image' });
  });

  it('gives every primary page a distinct title and description', () => {
    const paths = ['/', '/models', '/about', '/contact', '/apply', '/news', '/runway', '/privacy', '/terms'];
    const titles = paths.map((path) => getPageMeta(path).find((meta) => meta.title)?.title);
    const descriptions = paths.map((path) => getPageMeta(path).find((meta) => meta.name === 'description')?.content);
    expect(new Set(titles).size).toBe(paths.length);
    expect(new Set(descriptions).size).toBe(paths.length);
    expect(getPageMeta('/models/')).toEqual(getPageMeta('/models'));
  });

  it.each([
    ['/', `${SITE_URL}/`],
    ['/models/?utm_source=instagram', `${SITE_URL}/models`],
    ['/news/editorial#photos', `${SITE_URL}/news/editorial`],
  ])('normalizes canonical URL %s', (path, expected) => {
    expect(canonicalUrl(path)).toBe(expected);
  });

  it('keeps detail metadata consistent across search, Open Graph, and Twitter', () => {
    const meta = createPageMeta({
      title: 'Editorial | DSTRCT',
      description: 'A new editorial.',
      image: 'https://cdn.sanity.io/editorial.jpg',
      imageAlt: 'Editorial cover',
      type: 'article',
    });
    expect(meta).toContainEqual({ property: 'og:type', content: 'article' });
    expect(meta).toContainEqual({ property: 'og:image', content: 'https://cdn.sanity.io/editorial.jpg' });
    expect(meta).toContainEqual({ name: 'twitter:image', content: 'https://cdn.sanity.io/editorial.jpg' });
    expect(meta).toContainEqual({ name: 'twitter:title', content: 'Editorial | DSTRCT' });
  });

  it('identifies the brand, website, and official Instagram in structured data', () => {
    const [organization, website] = homeStructuredData['@graph'];
    expect(organization).toMatchObject({ name: 'DSTRCT', url: `${SITE_URL}/`, logo: `${SITE_URL}/brand-logo.png` });
    expect(organization.sameAs).toContain('https://www.instagram.com/dstrctmgmt/');
    expect(website).toMatchObject({ '@type': 'WebSite', name: 'DSTRCT', publisher: { '@id': organization['@id'] } });
  });
});

describe('rendered homepage and route head', () => {
  it('server-renders the existing hero, favicon, metadata, and valid JSON-LD without extra homepage copy', async () => {
    const router = await loadPage();
    router.update({ isServer: true });
    const html = renderToStaticMarkup(<RouterProvider router={router} />);
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.title).toBe(HOME_TITLE);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(HOME_DESCRIPTION);
    expect(document.querySelector('#agency-heading')).toBeNull();
    expect(document.querySelector('main')?.textContent).not.toContain('personal, dedicated management');
    expect(document.querySelector('footer div[data-nosnippet]')).not.toBeNull();
    expect(document.querySelector('link[rel="icon"][sizes="96x96"]')?.getAttribute('href')).toBe('/favicon-96.png');
    expect(document.querySelector('video')?.getAttribute('poster')).toBe('/home-video-poster.webp');
    expect(JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? '')).toEqual(homeStructuredData);
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it.each([
    ['production', 'index, follow, max-image-preview:large'],
    ['staging', 'noindex, follow'],
  ])('uses the correct indexing directive for %s', async (environment, expected) => {
    const router = await loadPage('/', environment);
    expect(router.state.matches[0].meta).toContainEqual({ name: 'robots', content: expected });
  });

  it('uses the leaf route for canonical URLs and updates metadata on client navigation', async () => {
    const router = await loadPage('/news/editorial?utm_source=instagram');
    expect(router.state.matches[0].links).toContainEqual({ rel: 'canonical', href: `${SITE_URL}/news/editorial` });
    expect(router.state.matches[0].meta).toContainEqual({ property: 'og:url', content: `${SITE_URL}/news/editorial` });
    await router.navigate({ to: '/models' });
    expect(router.state.matches[0].links).toContainEqual({ rel: 'canonical', href: `${SITE_URL}/models` });
    expect(router.state.matches[0].meta).toContainEqual({ title: 'Models | DSTRCT Amsterdam' });
    expect(router.state.matches[0].headScripts).toEqual([]);
  });

  it('does not index missing pages on production', async () => {
    const router = await loadPage('/missing-page');
    expect(router.state.matches[0].meta).toContainEqual({ name: 'robots', content: 'noindex, follow' });
  });
});

describe('public crawler and brand assets', () => {
  const readPublic = (path: string) => readFileSync(resolve(process.cwd(), 'public', path));

  it('lists the main production pages in a valid sitemap and advertises it to crawlers', () => {
    const sitemap = new DOMParser().parseFromString(readPublic('sitemap.xml').toString(), 'application/xml');
    expect(sitemap.querySelector('parsererror')).toBeNull();
    const urls = Array.from(sitemap.querySelectorAll('loc'), (location) => location.textContent);
    expect(urls).toHaveLength(9);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls.every((url) => url?.startsWith(`${SITE_URL}/`))).toBe(true);
    expect(readPublic('robots.txt').toString()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it('ships square PNG icons, a multi-resolution ICO, and a 1200 by 630 sharing image', () => {
    const assets = [
      ['favicon-48.png', 48, 48],
      ['favicon-96.png', 96, 96],
      ['apple-touch-icon.png', 180, 180],
      ['favicon-192.png', 192, 192],
      ['favicon-512.png', 512, 512],
      ['og-image.png', 1200, 630],
    ] as const;
    for (const [filename, width, height] of assets) {
      const png = readPublic(filename);
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect(png.readUInt32BE(16)).toBe(width);
      expect(png.readUInt32BE(20)).toBe(height);
    }
    const icon = readPublic('favicon.ico');
    expect(icon.readUInt16LE(2)).toBe(1);
    expect(icon.readUInt16LE(4)).toBe(6);
    const manifest = JSON.parse(readPublic('site.webmanifest').toString());
    expect(manifest.icons).toHaveLength(2);
    for (const asset of manifest.icons) expect(readPublic(asset.src.slice(1)).length).toBeGreaterThan(0);
  });
});
