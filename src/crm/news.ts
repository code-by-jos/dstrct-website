import type { SanityImageSource } from '@sanity/image-url';
import { fetchFromSanity, urlFor } from '@/crm/sanity';
import type { NewsCategory, NewsImage, NewsPage, NewsPageRequest, NewsPost, NewsSummary } from '@/types/News';

interface SanityNewsImage {
  asset: { _ref: string };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; width: number; height: number };
}

interface SanityNewsSummary {
  _id: string;
  title: string;
  slug: { current: string };
  category: NewsCategory;
  publishedAt: string;
  excerpt?: string;
  coverImage: SanityNewsImage;
}

interface SanityNewsPost extends SanityNewsSummary {
  body?: string;
  gallery?: SanityNewsImage[];
}

// Both the listing and direct links must only expose published, complete posts.
const NEWS_FILTER = `_type == "newsPost"
  && !(_id in path("drafts.**"))
  && !(_id in path("versions.**"))
  && category in ["runway", "general"]
  && defined(slug.current)
  && defined(coverImage.asset)
  && publishedAt <= now()`;

const SUMMARY_FIELDS = `_id, title, slug, category, publishedAt, excerpt, coverImage`;

function imageUrl(image: SanityNewsImage, width: number) {
  return urlFor(image as SanityImageSource)
    .width(width)
    .fit('max')
    .auto('format');
}

function mapSummary(post: SanityNewsSummary): NewsSummary {
  const cover = imageUrl(post.coverImage, 900)
    .height(post.category === 'runway' ? 1350 : 900)
    .fit('crop')
    .url();

  return {
    id: post._id,
    title: post.title,
    slug: post.slug.current,
    category: post.category,
    publishedAt: post.publishedAt,
    excerpt: post.excerpt || '',
    coverImage: { src: cover, alt: post.title },
  };
}

export async function fetchNews({ category, cursor = null, limit = 12 }: NewsPageRequest): Promise<NewsPage> {
  const posts = await fetchFromSanity<SanityNewsSummary[]>(
    `*[${NEWS_FILTER} && category == $category
      && ($cursorDate == null || publishedAt < $cursorDate || (publishedAt == $cursorDate && _id > $cursorId))
    ] | order(publishedAt desc, _id asc) [0...$fetchLimit] {${SUMMARY_FIELDS}}`,
    { category, cursorDate: cursor?.publishedAt ?? null, cursorId: cursor?.id ?? null, fetchLimit: limit + 1 },
    'news',
  );

  const page = posts.slice(0, limit);
  const lastPost = page.at(-1);
  return {
    posts: page.map(mapSummary),
    nextCursor: posts.length > limit && lastPost ? { publishedAt: lastPost.publishedAt, id: lastPost._id } : null,
  };
}

export async function fetchNewsPost(slug: string, category?: NewsCategory): Promise<NewsPost | null> {
  const post = await fetchFromSanity<SanityNewsPost | null>(
    `*[${NEWS_FILTER} && slug.current == $slug && ($category == null || category == $category)][0] {${SUMMARY_FIELDS}, body, gallery[defined(asset)]}`,
    { slug, category: category ?? null },
    'news post',
  );

  if (!post) return null;

  const seenAssets = new Set<string>();
  const photos: NewsImage[] = [post.coverImage, ...(post.gallery || [])]
    .filter((image) => {
      if (seenAssets.has(image.asset._ref)) return false;
      seenAssets.add(image.asset._ref);
      return true;
    })
    .map((image, index) => ({ src: imageUrl(image, 1800).url(), alt: `${post.title}, photo ${index + 1}` }));

  return { ...mapSummary(post), body: post.body || '', photos };
}
