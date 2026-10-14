import * as t from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";
import { pgEnum, pgTable as pg_table } from "drizzle-orm/pg-core";

export const user = pg_table("user", {
  id: t.text("id").primaryKey(),
  name: t.text("name").notNull(),
  email: t.text("email").notNull().unique(),
  emailVerified: t.boolean("email_verified").notNull(),
  image: t.text("image"),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const session = pg_table("session", {
  id: t.text("id").primaryKey(),
  expiresAt: t.timestamp("expires_at").notNull(),
  token: t.text("token").notNull().unique(),
  ipAddress: t.text("ip_address"),
  userAgent: t.text("user_agent"),
  userId: t.text("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const account = pg_table("account", {
  id: t.text("id").primaryKey(),
  accountId: t.text("account_id").notNull(),
  providerId: t.text("provider_id").notNull(),
  userId: t.text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: t.text("access_token"),
  refreshToken: t.text("refresh_token"),
  idToken: t.text("id_token"),
  accessTokenExpiresAt: t.timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: t.timestamp("refresh_token_expires_at"),
  scope: t.text("scope"),
  password: t.text("password"),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const verification = pg_table("verification", {
  id: t.text("id").primaryKey(),
  identifier: t.text("identifier").notNull(),
  value: t.text("value").notNull(),
  expiresAt: t.timestamp("expires_at").notNull(),
  createdAt: t.timestamp("created_at"),
  updatedAt: t.timestamp("updated_at"),
});

export const event = pg_table("event", {
  id: t.uuid("id").defaultRandom().primaryKey(),
  theme: t.text("theme").notNull(),
  time: t.timestamp("time").notNull(),
  description: t.text("description"),
  location: t.varchar("location", { length: 256 }),
  startDate: t.timestamp("start_date").notNull(),
  endDate: t.timestamp("end_date").notNull(),
  badgeImage: t.text("badge_image"),
  isRecurring: t.boolean("is_recurring").default(false).notNull(),
  recurringDays: t.jsonb("recurring_days").$type<string[]>().default([]).notNull(),
  hasMorningSession: t.boolean("has_morning_session").default(false).notNull(),
  morningTime: t.varchar("morning_time", { length: 50 }),
  hasEveningSession: t.boolean("has_evening_session").default(false).notNull(),
  eveningTime: t.varchar("evening_time", { length: 50 }),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

// Remember to add the flyer for both mobile and desktop.
export const flyer_enum = pgEnum("flyer_enum", ["mobile", "desktop"]);

export const flyer = pg_table("flyer", {
  id: t.uuid("id").defaultRandom().primaryKey(),
  eventId: t.uuid("event_id")
    .notNull()
    .references(() => event.id),
  image: t.text("image").notNull(),
  type: flyer_enum().notNull(),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const minister = pg_table("minister", {
  id: t.uuid("id").defaultRandom().primaryKey(),
  firstName: t.varchar("first_name", { length: 256 }),
  lastName: t.varchar("last_name", { length: 256 }),
  title: t.varchar("title", { length: 256 }),
  image: t.text("image"),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const event_minister = pg_table(
  "event_minister",
  {
    eventId: t.uuid("event_id")
      .notNull()
      .references(() => event.id),
    ministerId: t.uuid("minister_id")
      .notNull()
      .references(() => minister.id),
  },
  (table) => [
    t.primaryKey({ columns: [table.eventId, table.ministerId] }),
  ],
);

export const reservation = pg_table(
  "reservation",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    eventId: t.uuid("event_id")
      .notNull()
      .references(() => event.id),
    firstName: t.varchar("first_name", { length: 256 }),
    lastName: t.varchar("last_name", { length: 256 }),
    email: t.text("email").notNull(),
    phone: t.text("phone").notNull(),
    attendanceMode: t.varchar("attendance_mode", { length: 50 }).default("in-person").notNull(),
    session: t.varchar("session", { length: 50 }).default("both").notNull(),
    preferredDay: t.varchar("preferred_day", { length: 100 }),
    badgePhoto: t.text("badge_photo"),
    createdAt: t.timestamp("created_at").notNull(),
    updatedAt: t.timestamp("updated_at").notNull(),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)],
);

export const contact_for_enum = pgEnum("contact_for", [
  "general",
  "prayer",
  "counseling",
]);

export const contact = pg_table("contact", {
  id: t.uuid("id").defaultRandom().primaryKey(),
  firstName: t.varchar("first_name", { length: 256 }),
  lastName: t.varchar("last_name", { length: 256 }),
  email: t.text("email").notNull(),
  phone: t.text("phone").notNull(),
  message: t.text("message").notNull(),
  for: contact_for_enum().default("general").notNull(),
  attendedTo: t.boolean("attended_to").notNull().default(false),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const testimonial = pg_table("testimonial", {
  id: t.uuid("id").defaultRandom().primaryKey(),
  firstName: t.varchar("first_name", { length: 256 }),
  lastName: t.varchar("last_name", { length: 256 }),
  email: t.text("email"),
  message: t.text("message").notNull(),
  isVerified: t.boolean("is_verified").notNull().default(false),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const testimonial_image = pg_table("testimonial_image", {
  id: t.uuid("id").defaultRandom().primaryKey(),
  testimonialId: t.uuid("testimonial_id")
    .notNull()
    .references(() => testimonial.id),
  image: t.text("image").notNull(),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const youtube_video = pg_table("youtube_video", {
  videoId: t.text("video_id").primaryKey(),
  title: t.text("title").notNull(),
  link: t.text("link").notNull(),
  timeLength: t.text("time_length").notNull(),
  datePosted: t.date("date_posted").notNull(),
  featuredImg: t.text("featured_img").notNull(),
  position: t.integer("position").notNull(),
});

export const relations = defineRelations(
  {
    user,
    session,
    account,
    verification,
    event,
    flyer,
    minister,
    event_minister,
    reservation,
    contact,
    testimonial,
    testimonial_image,
    youtube_video,
  },
  ({
    one,
    many,
    user: user_columns,
    session: session_columns,
    account: account_columns,
    event: event_columns,
    flyer: flyer_columns,
    minister: minister_columns,
    event_minister: event_minister_columns,
    reservation: reservation_columns,
    testimonial: testimonial_columns,
    testimonial_image: testimonial_image_columns,
  }) => ({
    user: {
      sessions: many.session(),
      accounts: many.account(),
    },
    session: {
      user: one.user({
        from: session_columns.userId,
        to: user_columns.id,
        optional: false,
      }),
    },
    account: {
      user: one.user({
        from: account_columns.userId,
        to: user_columns.id,
        optional: false,
      }),
    },
    event: {
      flyers: many.flyer(),
      reservations: many.reservation(),
      ministers: many.event_minister(),
    },
    minister: {
      events: many.event_minister(),
    },
    event_minister: {
      event: one.event({
        from: event_minister_columns.eventId,
        to: event_columns.id,
        optional: false,
      }),
      minister: one.minister({
        from: event_minister_columns.ministerId,
        to: minister_columns.id,
        optional: false,
      }),
    },
    flyer: {
      event: one.event({
        from: flyer_columns.eventId,
        to: event_columns.id,
        optional: false,
      }),
    },
    reservation: {
      event: one.event({
        from: reservation_columns.eventId,
        to: event_columns.id,
        optional: false,
      }),
    },
    testimonial: {
      images: many.testimonial_image(),
    },
    testimonial_image: {
      testimonial: one.testimonial({
        from: testimonial_image_columns.testimonialId,
        to: testimonial_columns.id,
        optional: false,
      }),
    },
  }),
);
