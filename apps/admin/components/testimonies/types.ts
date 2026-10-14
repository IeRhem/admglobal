export interface TestimonyImageItem {
  id: string;
  testimonialId: string;
  image: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AdminTestimonyItem {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  message: string;
  isVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  images: TestimonyImageItem[];
}
