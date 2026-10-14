export interface EventFlyerItem {
  id: string;
  eventId: string;
  image: string;
  type: "mobile" | "desktop";
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EventMinisterItem {
  id: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  image: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EventReservationItem {
  id: string;
  eventId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  attendanceMode?: string | null;
  session?: string | null;
  preferredDay?: string | null;
  badgePhoto?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AdminEventItem {
  id: string;
  theme: string;
  time: string | Date;
  description: string | null;
  location: string | null;
  startDate: string | Date;
  endDate: string | Date;
  badgeImage?: string | null;
  isRecurring?: boolean;
  recurringDays?: string[];
  hasMorningSession?: boolean;
  morningTime?: string | null;
  hasEveningSession?: boolean;
  eveningTime?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  flyers: EventFlyerItem[];
  ministers: EventMinisterItem[];
  reservations: EventReservationItem[];
}
