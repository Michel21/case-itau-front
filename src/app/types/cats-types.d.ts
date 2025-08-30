export interface ICatsTypes {
  id: string;
  url: string;
  name: string;
  width: string;
  height: string;
  mime_type: string;
  entities: [];
  origin: string;
  breeds: Breed[];
  animals: [];
  categories: [];
  temperament?: string;
  description?: string;
  intelligence?: number;
  adaptability?: number;
  life_span?: string;
  image?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface Breed {
  id: number;
  name: string;
  wikipedia_url: string;
  temperament?: string;
  description?: string;
  intelligence?: number;
  adaptability?: number;
  life_span?: string;
}