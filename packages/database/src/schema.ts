import * as t from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";
import { pgEnum, pgTable as pg_table } from "drizzle-orm/pg-core";

export const user = pg_table("user", {
  id: t.text("id").primaryKey(),
  name: t.text("name").notNull(),
  email: t.text("email").notNull().unique(),
  emailVerified: t.boolean("email_verified").notNull(),
  image: t.text("image"),
  role: t.text("role").notNull().default("user"),
  banned: t.boolean("banned").default(false),
  banReason: t.text("ban_reason"),
  banExpires: t.timestamp("ban_expires"),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const church_branch = pg_table("church_branch", {
  id: t.uuid("id").defaultRandom().primaryKey(),
  name: t.text("name").notNull(),
  location: t.text("location"),
  state: t.text("state").notNull(),
  country: t.text("country").notNull(),
  city: t.text("city").notNull(),
  address: t.text("address").notNull(),
  googleMapsUrl: t.text("google_maps_url"),
  createdBy: t.text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
});

export const branch_role = pg_table(
  "branch_role",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    name: t.text("name").notNull(),
    pages: t.jsonb("pages").$type<string[]>().default([]).notNull(),
    createdBy: t.text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [t.uniqueIndex("branch_role_name_unique").on(table.name)],
);

export const branch_staff = pg_table(
  "branch_staff",
  {
    branchId: t
      .uuid("branch_id")
      .notNull()
      .references(() => church_branch.id, { onDelete: "cascade" }),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: t
      .uuid("role_id")
      .notNull()
      .references(() => branch_role.id, { onDelete: "restrict" }),
    assignedBy: t.text("assigned_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    t.primaryKey({ columns: [table.branchId, table.userId] }),
    t.index("branch_staff_user_idx").on(table.userId),
  ],
);

export const activity_log = pg_table(
  "activity_log",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    actorUserId: t.text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    actorName: t.text("actor_name").notNull(),
    action: t.text("action").notNull(),
    entityType: t.text("entity_type").notNull(),
    entityId: t.text("entity_id"),
    description: t.text("description").notNull(),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [t.index("activity_log_created_at_idx").on(table.createdAt)],
);

export type ServiceReportExpense = {
  purpose: string;
  amount: string;
  paymentMethod: string;
  approvedBy: string;
  remarks: string;
};

export const service_report = pg_table(
  "service_report",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    serviceDate: t.date("service_date").notNull(),
    location: t.text("location").notNull(),
    serviceType: t.text("service_type").notNull(),
    otherServiceType: t.text("other_service_type"),
    minister: t.text("minister").notNull(),
    theme: t.text("theme").notNull(),
    men: t.integer("men").notNull(),
    women: t.integer("women").notNull(),
    children: t.integer("children").notNull(),
    firstTimeAttendees: t.integer("first_time_attendees").notNull(),
    newConverts: t.integer("new_converts").notNull(),
    totalAttendance: t.integer("total_attendance").notNull(),
    attendanceRemarks: t.text("attendance_remarks"),
    testimonies: t.text("testimonies"),
    offering: t.numeric("offering", { precision: 12, scale: 2 }).notNull(),
    tithes: t.numeric("tithes", { precision: 12, scale: 2 }).notNull(),
    projectOffering: t
      .numeric("project_offering", { precision: 12, scale: 2 })
      .notNull(),
    sacrificialOffering: t
      .numeric("sacrificial_offering", { precision: 12, scale: 2 })
      .notNull(),
    specialSeeds: t
      .numeric("special_seeds", { precision: 12, scale: 2 })
      .notNull(),
    otherIncome: t
      .numeric("other_income", { precision: 12, scale: 2 })
      .notNull(),
    totalFundsReceived: t
      .numeric("total_funds_received", { precision: 12, scale: 2 })
      .notNull(),
    expenses: t
      .jsonb("expenses")
      .$type<ServiceReportExpense[]>()
      .default([])
      .notNull(),
    totalExpenses: t
      .numeric("total_expenses", { precision: 12, scale: 2 })
      .notNull(),
    balanceRemaining: t
      .numeric("balance_remaining", { precision: 12, scale: 2 })
      .notNull(),
    soulsSaved: t.integer("souls_saved").notNull(),
    followUpNotes: t.text("follow_up_notes"),
    serviceSummary: t.text("service_summary"),
    nextPreparations: t.text("next_preparations"),
    locationAdministrator: t.text("location_administrator").notNull(),
    locationAdministratorSignature: t
      .text("location_administrator_signature")
      .notNull(),
    locationAdministratorDate: t.date("location_administrator_date").notNull(),
    accountant: t.text("accountant").notNull(),
    accountantSignature: t.text("accountant_signature").notNull(),
    accountantDate: t.date("accountant_date").notNull(),
    residentPastor: t.text("resident_pastor").notNull(),
    residentPastorSignature: t.text("resident_pastor_signature").notNull(),
    residentPastorDate: t.date("resident_pastor_date").notNull(),
    declarationConfirmed: t.boolean("declaration_confirmed").notNull(),
    submittedByName: t.text("submitted_by_name").notNull(),
    submissionSignature: t.text("submission_signature").notNull(),
    submissionDate: t.date("submission_date").notNull(),
    submittedBy: t.text("submitted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [t.index("service_report_service_date_idx").on(table.serviceDate)],
);

export const session = pg_table("session", {
  id: t.text("id").primaryKey(),
  expiresAt: t.timestamp("expires_at").notNull(),
  token: t.text("token").notNull().unique(),
  ipAddress: t.text("ip_address"),
  userAgent: t.text("user_agent"),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id),
  impersonatedBy: t.text("impersonated_by"),
  createdAt: t.timestamp("created_at").notNull(),
  updatedAt: t.timestamp("updated_at").notNull(),
});

export const account = pg_table("account", {
  id: t.text("id").primaryKey(),
  accountId: t.text("account_id").notNull(),
  providerId: t.text("provider_id").notNull(),
  userId: t
    .text("user_id")
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
  recurringDays: t
    .jsonb("recurring_days")
    .$type<string[]>()
    .default([])
    .notNull(),
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
  eventId: t
    .uuid("event_id")
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
    eventId: t
      .uuid("event_id")
      .notNull()
      .references(() => event.id),
    ministerId: t
      .uuid("minister_id")
      .notNull()
      .references(() => minister.id),
  },
  (table) => [t.primaryKey({ columns: [table.eventId, table.ministerId] })],
);

export const reservation = pg_table(
  "reservation",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    eventId: t
      .uuid("event_id")
      .notNull()
      .references(() => event.id),
    firstName: t.varchar("first_name", { length: 256 }),
    lastName: t.varchar("last_name", { length: 256 }),
    email: t.text("email").notNull(),
    phone: t.text("phone").notNull(),
    attendanceMode: t
      .varchar("attendance_mode", { length: 50 })
      .default("in-person")
      .notNull(),
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
  testimonialId: t
    .uuid("testimonial_id")
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
