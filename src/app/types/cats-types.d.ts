export interface ICatsTypes {
  id: string;
  url: string;
  name: string;
  width: string;
  height: string;
  mime_type: string;
  entities: [];
  origin: string;
  breeds: [
    {
      id: 3;
      name: string;
      wikipedia_url: string;
    },
    {
      id: 2;
      name: string;
      wikipedia_url: string;
    }
  ];
  animals: [];
  categories: [];
}