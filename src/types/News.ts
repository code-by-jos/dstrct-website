export type NewsCategory = 'runway' | 'general';

export interface NewsCursor {
  publishedAt: string;
  id: string;
}

export interface NewsPageRequest {
  category: NewsCategory;
  cursor?: NewsCursor | null;
  limit?: number;
}

export interface NewsPage {
  posts: NewsSummary[];
  nextCursor: NewsCursor | null;
}

export type NewsListingPath = '/news' | '/runway';

export interface NewsImage {
  src: string;
  alt: string;
}

export interface NewsSummary {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  publishedAt: string;
  excerpt: string;
  coverImage: NewsImage;
}

export interface NewsPost extends NewsSummary {
  body: string;
  photos: NewsImage[];
}
