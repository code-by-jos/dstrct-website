import type { SanityImageSource } from '@sanity/image-url';
import type { Model } from '@/types/Model';
import { fetchFromSanity, urlFor } from '@/crm/sanity';
import { textToSlug, slugToText } from '@/utils/slug';

export interface SanityModel extends Omit<Model, 'photo' | 'photos' | 'slug'> {
  photo: SanityImageSource;
  photos: SanityImageSource[];
  slug?: { current: string };
}

const MODEL_FIELDS = `
  name,
  slug,
  photo,
  photos,
  socials,
  stats
`;

function mapSanityModel(model: SanityModel): Model {
  return {
    ...model,
    slug: model.slug?.current || textToSlug(model.name),
    photo: model.photo ? urlFor(model.photo).width(800).url() : '',
    photos: model.photos ? model.photos.map((p) => urlFor(p).width(800).url()) : [],
  };
}

export async function fetchModels(): Promise<Model[]> {
  const sanityModels = await fetchFromSanity<SanityModel[]>(`*[_type == "model"]{${MODEL_FIELDS}}`, undefined, 'models');
  return sanityModels.map(mapSanityModel);
}

export async function fetchModel(slug: string): Promise<Model | null> {
  const sanityModels = await fetchFromSanity<SanityModel[]>(
    `*[_type == "model" && name == $name]{${MODEL_FIELDS}}`,
    { name: slugToText(slug) },
    'model'
  );

  if (sanityModels.length === 0) {
    return null;
  }

  return mapSanityModel(sanityModels[0]);
}