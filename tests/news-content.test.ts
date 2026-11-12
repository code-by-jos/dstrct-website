import { beforeEach, describe, expect, it, vi } from 'vitest';
import { evaluate, parse } from 'groq-js';
import { fetchNews, fetchNewsPost } from '@/crm/news';
import { fetchFromSanity } from '@/crm/sanity';

vi.mock('@/crm/sanity', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/crm/sanity')>()),
  fetchFromSanity: vi.fn(),
}));

const cover = {
  _type: 'image',
  asset: { _type: 'reference', _ref: 'image-abcdef123456-1200x1800-jpg' },
};
const extra = {
  _type: 'image',
  asset: { _type: 'reference', _ref: 'image-fedcba654321-1600x1000-jpg' },
};
const publishedPost = {
  _type: 'newsPost',
  _id: 'published',
  title: 'Published runway post',
  slug: { current: 'published-runway-post' },
  category: 'runway',
  publishedAt: '2026-01-01T12:00:00Z',
  coverImage: cover,
  body: 'Photo credits.',
  gallery: [cover, extra, { _type: 'image' }],
};

let dataset: Record<string, unknown>[];

beforeEach(() => {
  dataset = [
    publishedPost,
    { ...publishedPost, _id: 'published-b', slug: { current: 'same-date' } },
    { ...publishedPost, _id: 'older', slug: { current: 'older' }, publishedAt: '2025-12-01T12:00:00Z' },
    { ...publishedPost, _id: 'newer', slug: { current: 'newer' }, category: 'general', publishedAt: '2026-02-01T12:00:00Z' },
    { ...publishedPost, _id: 'drafts.hidden', slug: { current: 'draft' } },
    { ...publishedPost, _id: 'versions.release.hidden', slug: { current: 'release' } },
    { ...publishedPost, _id: 'future', slug: { current: 'future' }, publishedAt: '2099-01-01T12:00:00Z' },
    { ...publishedPost, _id: 'no-cover', slug: { current: 'no-cover' }, coverImage: null },
    { ...publishedPost, _id: 'no-date', slug: { current: 'no-date' }, publishedAt: null },
    { ...publishedPost, _id: 'no-slug', slug: null },
    { ...publishedPost, _id: 'invalid-section', slug: { current: 'invalid-section' }, category: 'other' },
  ];

  // Evaluate the actual GROQ queries against fixtures, without writing to Sanity.
  vi.mocked(fetchFromSanity).mockImplementation(async (query, params) => {
    const result = await evaluate(parse(query, { params }), { dataset, params, timestamp: new Date('2026-06-01T12:00:00Z') });
    return result.get();
  });
});

describe('published news content', () => {
  it('lists only eligible published posts, newest first, without loading galleries or article bodies', async () => {
    const { posts, nextCursor } = await fetchNews({ category: 'runway' });
    expect(posts.map((post) => post.id)).toEqual(['published', 'published-b', 'older']);
    expect(nextCursor).toBeNull();
    expect(posts.every((post) => post.category === 'runway')).toBe(true);
    expect(posts[0].coverImage.alt).toBe('Published runway post');
    expect(posts[0].coverImage.src).toContain('auto=format');
    expect(posts[0]).not.toHaveProperty('photos');
    expect(posts[0]).not.toHaveProperty('body');
    expect((await fetchNews({ category: 'general' })).posts.map((post) => post.id)).toEqual(['newer']);
  });

  it('paginates at the server with a stable date/id cursor, including tied dates and concurrent changes', async () => {
    const first = await fetchNews({ category: 'runway', limit: 1 });
    expect(first.posts.map((post) => post.id)).toEqual(['published']);
    expect(first.nextCursor).toEqual({ publishedAt: publishedPost.publishedAt, id: 'published' });
    dataset = dataset.filter((post) => post._id !== 'published');
    dataset.push({ ...publishedPost, _id: 'just-added', publishedAt: '2026-03-01T12:00:00Z' });
    const second = await fetchNews({ category: 'runway', cursor: first.nextCursor, limit: 1 });
    expect(second.posts.map((post) => post.id)).toEqual(['published-b']);
    const third = await fetchNews({ category: 'runway', cursor: second.nextCursor, limit: 1 });
    expect(third.posts.map((post) => post.id)).toEqual(['older']);
    expect(third.nextCursor).toBeNull();
  });

  it('rejects recent posts on runway URLs, while keeping existing news URLs available', async () => {
    expect(await fetchNewsPost('newer', 'runway')).toBeNull();
    expect((await fetchNewsPost('published-runway-post', 'runway'))?.id).toBe('published');
    expect((await fetchNewsPost('published-runway-post'))?.id).toBe('published');
  });

  it('preserves photo order, includes the cover first, and skips duplicates and incomplete uploads', async () => {
    const post = await fetchNewsPost('published-runway-post');
    expect(post?.body).toBe('Photo credits.');
    expect(post?.photos.map((photo) => photo.alt)).toEqual(['Published runway post, photo 1', 'Published runway post, photo 2']);
    expect(post?.photos[0].src).toContain('abcdef123456');
    expect(post?.photos[1].src).toContain('fedcba654321');
    expect(post?.photos[0].src).toContain('w=1800');
    expect(post?.photos[0].src).not.toContain('h=');
  });

  it.each(['draft', 'release', 'future', 'no-cover', 'no-date', 'invalid-section', 'unknown', '" || true || "'])(
    'does not expose an unavailable post through the direct slug %s',
    async (slug) => {
      expect(await fetchNewsPost(slug)).toBeNull();
    },
  );
});
