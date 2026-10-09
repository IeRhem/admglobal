export type Testimony = {
  id: string;
  category: "Testimony";
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
