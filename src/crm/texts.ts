import { fetchFromSanity } from '@/crm/sanity';

export interface TextDocument {
  _id: string;
  _type: string;
  type: string;
  text: string;
}

export async function fetchTextContent(type: string): Promise<TextDocument | null> {
  const query = `*[_type == "texts" && type=="${type}"][0]`;
  return fetchFromSanity<TextDocument>(query, undefined, `${type} content`);
}