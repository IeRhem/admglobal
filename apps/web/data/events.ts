export type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string; // ISO date string e.g. "2026-10-05"
  endDate?: string; // optional end date for multi-day events
  time: string; // e.g. "9:00 AM"
  location: string;
  image: string; // path to image in /public
};

/**
 * Upcoming events sorted by date (nearest first).
 * Replace placeholder images with real event flyers/posters.
 */
export const upcomingEvents: UpcomingEvent[] = [
  {
    id: "wosr-october-2026",
    title: "Week of Spiritual Renewal (WOSR)",
    description:
      "A powerful week of prayer, worship, and the Word. Come experience a fresh outpouring of the Holy Spirit and receive your miracle.",
    fullDescription:
      "The Week of Spiritual Renewal (WOSR) is one of the most anticipated gatherings at Arrow of Deliverance Ministries. It is a time set apart for deep fellowship with the Holy Spirit, intense prayer, powerful worship, and life-changing messages from the Word of God.\n\nDuring this week, believers come together to seek the face of God, receive fresh fire, and experience divine encounters. Many have testified of healings, breakthroughs, and deliverances during past WOSR programs.\n\nWhether you are seeking direction, healing, deliverance, or simply a deeper walk with God, the WOSR is designed to meet you at your point of need. Come with expectation — God is ready to do a new thing in your life!",
    date: "2026-10-13",
    endDate: "2026-10-17",
    time: "5:00 PM Daily",
    location: "ADMI Victory Chapel, Jalingo",
    image: "/grid-image/image-1.jpg",
  },
  {
    id: "annual-thanksgiving-2026",
    title: "Annual Thanksgiving Service",
    description:
      "Join us as we give glory to God for His faithfulness throughout the year. Come with your thanksgiving offering and testimonies.",
    fullDescription:
      "Our Annual Thanksgiving Service is a special time when the entire church family comes together to celebrate God's goodness, faithfulness, and provision throughout the year.\n\nThis service is filled with joyful praise, heartfelt worship, powerful testimonies, and a time of giving back to God in gratitude. Members and guests are encouraged to come prepared with their thanksgiving offerings and testimonies of what God has done in their lives.\n\nIt is a day of celebration, reflection, and gratitude. Invite your family, friends, and loved ones to join us as we honour the Lord for His faithfulness.",
    date: "2026-11-29",
    time: "8:00 AM",
    location: "ADMI Victory Chapel, Jalingo",
    image: "/grid-image/image-5.jpg",
  },
  {
    id: "crossover-night-2026",
    title: "Crossover Night Service",
    description:
      "Step into the new year with prayers, prophetic declarations, and praise. Don't miss this powerful night of encounter.",
    fullDescription:
      "The Crossover Night Service is the most powerful way to end the year and step into the new one. This special night is dedicated to prayers of thanksgiving, prophetic declarations for the coming year, and anointed praise and worship.\n\nThe man of God, Pastor Joseph M. Nwunuji, will minister the Word and release prophetic declarations over every life present. It is a night of divine alignment, spiritual positioning, and supernatural encounters.\n\nDon't step into the new year without a word from God. Come with your family and loved ones, and let us cross over together into a year of greater glory!",
    date: "2026-12-31",
    time: "10:00 PM",
    location: "ADMI Victory Chapel, Jalingo",
    image: "/grid-image/image-9.jpg",
  },
];
