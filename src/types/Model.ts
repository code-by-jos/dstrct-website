export interface Model {
  name: string;
  slug: string;
  photo: string;
  photos: string[];

  socials: {
    instagram: string;
  };

  stats: {
    height: string;
    hair: string;
    eyes: string;
    bust: string;
    waist: string;
    hips: string;
    shoes: string;
  };
}