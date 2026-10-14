export type Testimony = {
  id: string;
  category:
    | "Healing"
    | "Breakthroughs"
    | "Deliverance"
    | "Salvation"
    | "Provision"
    | "Testimony";
  title: string;
  excerpt: string;
  fullStory: string;
  date: string;
  images: string[];
  author: {
    name: string;
    location: string;
    avatar?: string;
  };
};
