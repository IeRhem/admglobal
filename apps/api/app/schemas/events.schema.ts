import z from "zod";

export const event_schema = z.object({
  id: z.uuid(),
  theme: z
    .string()
    .min(1, "Theme is required")
    .max(256, "Theme must be less than 256 characters"),
  description: z.string().min(1, "Description is required").nullable(),
  time: z.iso.time({ precision: 0, error: "Time is required" }),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().nullable(),
  badgeImage: z.string().nullable().optional(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.string()).default([]),
  hasMorningSession: z.boolean().default(false),
  morningTime: z.string().nullable().optional(),
  hasEveningSession: z.boolean().default(false),
  eveningTime: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const flyer_enum = z.enum(["mobile", "desktop"]);

export const flyer_schema = z.object({
  id: z.uuid(),
  eventId: z.uuid(),
  image: z.string().min(1, "Image is required"),
  type: flyer_enum,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const minister_schema = z.object({
  id: z.uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  title: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const reservation_schema = z.object({
  id: z.uuid(),
  eventId: z.uuid(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(256, "First name must be less than 256 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(256, "Last name must be less than 256 characters"),
  email: z
    .email("Invalid email address")
    .max(256, "Email must be less than 256 characters"),
  phone: z.string().min(1, "Phone is required"),
  attendanceMode: z.enum(["in-person", "online"]).default("in-person"),
  session: z.enum(["morning", "evening", "both", "all"]).default("both"),
  preferredDay: z.string().nullable().optional(),
  badgePhoto: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type event = z.infer<typeof event_schema>;
export type flyer = z.infer<typeof flyer_schema>;
export type flyer_type = z.infer<typeof flyer_enum>;
export type minister = z.infer<typeof minister_schema>;
export type reservation = z.infer<typeof reservation_schema>;

// Output schemas

export const event_output = event_schema.extend({
  flyers: z.array(flyer_schema),
  ministers: z.array(minister_schema),
});

export const event_list_output = z.object({
  events: z.array(event_output),
  total: z.number(),
  next_cursor: z.string().nullable(),
});

// Input schemas
const event_input_fields = {
  theme: event_schema.shape.theme,
  description: event_schema.shape.description,
  time: event_schema.shape.time,
  startDate: event_schema.shape.startDate,
  endDate: event_schema.shape.endDate,
  location: z.string().min(1).max(256),
  badgeImage: z.string().nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurringDays: z.array(z.string()).optional(),
  hasMorningSession: z.boolean().optional(),
  morningTime: z.string().nullable().optional(),
  hasEveningSession: z.boolean().optional(),
  eveningTime: z.string().nullable().optional(),
};

export const create_event_input = z.object(event_input_fields);

export const update_event_input = z.object({
  id: event_schema.shape.id,
  ...event_input_fields,
});

export const add_flyer_input = flyer_schema.pick({
  eventId: true,
  image: true,
  type: true,
});

export const update_flyer_input = flyer_schema.pick({
  id: true,
  image: true,
  type: true,
});

export const add_minister_input = z.object({
  eventId: z.string().uuid(),
  firstName: z.string().min(1).max(256),
  lastName: z.string().min(1).max(256),
  title: z.string().min(1).max(256),
  image: z.string(),
});

export const update_minister_input = z.object({
  id: z.uuid(),
  eventId: z.uuid(),
  firstName: z.string().min(1).max(256),
  lastName: z.string().min(1).max(256),
  title: z.string().min(1).max(256),
  image: z.string(),
});

export const add_reservation_input = reservation_schema
  .pick({
    eventId: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    attendanceMode: true,
    session: true,
    preferredDay: true,
    badgePhoto: true,
  })
  .partial({
    attendanceMode: true,
    session: true,
    preferredDay: true,
    badgePhoto: true,
  });

export const update_reservation_input = reservation_schema
  .pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    preferredDay: true,
    badgePhoto: true,
  })
  .partial({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
  })
  .extend({
    attendanceMode: z.enum(["in-person", "online"]).optional(),
    session: z.enum(["morning", "evening", "both", "all"]).optional(),
  });

export const delete_event_input = z.object({
  id: z.uuid(),
});

export const delete_flyer_input = z.object({
  id: z.uuid(),
});

export const get_event_input = z.object({
  id: z.uuid(),
});

export const list_events_input = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.uuid().nullable().default(null),
});
