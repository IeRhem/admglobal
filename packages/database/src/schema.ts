import * as t from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";
import { pgEnum, pgTable as pg_table } from "drizzle-orm/pg-core";

export const user = pg_table("user", {
  id: t.text("id").primaryKey(),
  name: t.text("name").notNull(),
  email: t.text("email").notNull().unique(),
  email_verified: t.boolean("email_verified").notNull(),
  image: t.text("image"),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const session = pg_table("session", {
  id: t.text("id").primaryKey(),
  expires_at: t.timestamp("expires_at").notNull(),
  token: t.text("token").notNull().unique(),
  ip_address: t.text("ip_address"),
  user_agent: t.text("user_agent"),
  user_id: t.text("user_id")
    .notNull()
    .references(() => user.id),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const account = pg_table("account", {
  id: t.text("id").primaryKey(),
  account_id: t.text("account_id").notNull(),
  provider_id: t.text("provider_id").notNull(),
  user_id: t.text("user_id")
    .notNull()
    .references(() => user.id),
  access_token: t.text("access_token"),
  refresh_token: t.text("refresh_token"),
  id_token: t.text("id_token"),
  access_token_expires_at: t.timestamp("access_token_expires_at"),
  refresh_token_expires_at: t.timestamp("refresh_token_expires_at"),
  scope: t.text("scope"),
  password: t.text("password"),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const verification = pg_table("verification", {
  id: t.text("id").primaryKey(),
  identifier: t.text("identifier").notNull(),
  value: t.text("value").notNull(),
  expires_at: t.timestamp("expires_at").notNull(),
  created_at: t.timestamp("created_at"),
  updated_at: t.timestamp("updated_at"),
});

export const event = pg_table("event", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  theme: t.text("theme").notNull(),
  time: t.timestamp("time").notNull(),
  description: t.text("description"),
  location: t.varchar("location", { length: 256 }),
  start_date: t.timestamp("start_date").notNull(),
  end_date: t.timestamp("end_date").notNull(),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

// Remember to add the flyer for both mobile and desktop.
export const flyer_enum = pgEnum("flyer_enum", ["mobile", "desktop"]);

export const flyer = pg_table("flyer", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  event_id: t.integer("event_id")
    .notNull()
    .references(() => event.id),
  image: t.text("image").notNull(),
  type: flyer_enum().notNull(),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const minister = pg_table("minister", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  first_name: t.varchar("first_name", { length: 256 }),
  last_name: t.varchar("last_name", { length: 256 }),
  title: t.varchar("title", { length: 256 }),
  image: t.text("image"),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const event_minister = pg_table(
  "event_minister",
  {
    event_id: t.integer("event_id")
      .notNull()
      .references(() => event.id),
    minister_id: t.integer("minister_id")
      .notNull()
      .references(() => minister.id),
  },
  (table) => [
    t.primaryKey({ columns: [table.event_id, table.minister_id] }),
  ],
);

export const reservation = pg_table(
  "reservation",
  {
    id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
    event_id: t.integer("event_id")
      .notNull()
      .references(() => event.id),
    first_name: t.varchar("first_name", { length: 256 }),
    last_name: t.varchar("last_name", { length: 256 }),
    email: t.text("email").notNull(),
    phone: t.text("phone").notNull(),
    created_at: t.timestamp("created_at").notNull(),
    updated_at: t.timestamp("updated_at").notNull(),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)],
);

export const contact_for_enum = pgEnum("contact_for", [
  "general",
  "prayer",
  "counseling",
]);

export const contact = pg_table("contact", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  first_name: t.varchar("first_name", { length: 256 }),
  last_name: t.varchar("last_name", { length: 256 }),
  email: t.text("email").notNull(),
  phone: t.text("phone").notNull(),
  message: t.text("message").notNull(),
  for: contact_for_enum().default("general").notNull(),
  attended_to: t.boolean("attended_to").notNull().default(false),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const testimonial = pg_table("testimonial", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  first_name: t.varchar("first_name", { length: 256 }),
  last_name: t.varchar("last_name", { length: 256 }),
  email: t.text("email"),
  message: t.text("message").notNull(),
  is_verified: t.boolean("is_verified").notNull().default(false),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const testimonial_image = pg_table("testimonial_image", {
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  testimonial_id: t.integer("testimonial_id")
    .notNull()
    .references(() => testimonial.id),
  image: t.text("image").notNull(),
  created_at: t.timestamp("created_at").notNull(),
  updated_at: t.timestamp("updated_at").notNull(),
});

export const youtube_video = pg_table("youtube_video", {
  video_id: t.text("video_id").primaryKey(),
  title: t.text("title").notNull(),
  link: t.text("link").notNull(),
  time_length: t.text("time_length").notNull(),
  date_posted: t.date("date_posted").notNull(),
  featured_img: t.text("featured_img").notNull(),
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
        from: session_columns.user_id,
        to: user_columns.id,
        optional: false,
      }),
    },
    account: {
      user: one.user({
        from: account_columns.user_id,
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
        from: event_minister_columns.event_id,
        to: event_columns.id,
        optional: false,
      }),
      minister: one.minister({
        from: event_minister_columns.minister_id,
        to: minister_columns.id,
        optional: false,
      }),
    },
    flyer: {
      event: one.event({
        from: flyer_columns.event_id,
        to: event_columns.id,
        optional: false,
      }),
    },
    reservation: {
      event: one.event({
        from: reservation_columns.event_id,
        to: event_columns.id,
        optional: false,
      }),
    },
    testimonial: {
      images: many.testimonial_image(),
    },
    testimonial_image: {
      testimonial: one.testimonial({
        from: testimonial_image_columns.testimonial_id,
        to: testimonial_columns.id,
        optional: false,
      }),
    },
  }),
);
