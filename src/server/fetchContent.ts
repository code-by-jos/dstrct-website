import { createServerFn } from '@tanstack/react-start';
import { fetchTextContent as fetchText, type TextDocument } from '@/crm/texts';
import { fetchModels as getModels, fetchModel as getModel } from '@/crm/models';
import type { Model } from '@/types/Model';
import { fetchNews, fetchNewsPost } from '@/crm/news';
import { z } from 'zod';

export const fetchTextContentFn = createServerFn({ method: 'GET' })
  .inputValidator((type: string) => type)
  .handler(async ({ data: type }): Promise<TextDocument | null> => {
    return fetchText(type);
  });

export const fetchModelsFn = createServerFn({ method: 'GET' }).handler(async (): Promise<Model[]> => {
  return getModels();
});

export const fetchModelFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Model | null> => {
    return getModel(slug);
  });

export const fetchNewsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      category: z.enum(['runway', 'general']),
      cursor: z.object({ publishedAt: z.iso.datetime(), id: z.string().min(1).max(200) }).nullish(),
      limit: z.number().int().min(1).max(24).optional(),
    }),
  )
  .handler(({ data }) => fetchNews(data));

export const fetchNewsPostFn = createServerFn({ method: 'GET' })
  .inputValidator(z.string().min(1).max(200))
  .handler(({ data: slug }) => fetchNewsPost(slug));

export const fetchRunwayPostFn = createServerFn({ method: 'GET' })
  .inputValidator(z.string().min(1).max(200))
  .handler(({ data: slug }) => fetchNewsPost(slug, 'runway'));
