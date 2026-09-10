import { createServerFn } from '@tanstack/react-start';
import { fetchTextContent as fetchText, type TextDocument } from '@/crm/texts';
import { fetchModels as getModels, fetchModel as getModel } from '@/crm/models';
import type { Model } from '@/types/Model';

export const fetchTextContentFn = createServerFn({ method: 'GET' })
  .inputValidator((type: string) => type)
  .handler(async ({ data: type }): Promise<TextDocument | null> => {
    return fetchText(type);
  });

export const fetchModelsFn = createServerFn({ method: 'GET' })
  .handler(async (): Promise<Model[]> => {
    return getModels();
  });

export const fetchModelFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Model | null> => {
    return getModel(slug);
  });
