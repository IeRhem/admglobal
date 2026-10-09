import z from "zod";

export const event_schema = z.object({
  id: z.number().int(),
  theme: z
    .string()
    .min(1, "Theme is required")
    .max(256, "Theme must be less than 256 characters"),
  description: z.string().min(1, "Description is required").nullable(),
  time: z.iso.time({ precision: 0, error: "Time is required" }),
  start_date: z.date(),
  end_date: z.date(),
  location: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const flyer_enum = z.enum(["mobile", "desktop"]);

export const flyer_schema = z.object({
  id: z.number().int(),
  event_id: z.number().int(),
  image: z.string().min(1, "Image is required"),
  type: flyer_enum,
  created_at: z.date(),
  updated_at: z.date(),
});

export const minister_schema = z.object({
  id: z.number().int(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  title: z.string().nullable(),
  image: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const reservation_schema = z.object({
  id: z.number().int(),
  event_id: z.number().int(),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(256, "First name must be less than 256 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(256, "Last name must be less than 256 characters"),
  email: z
    .email("Invalid email address")
    .max(256, "Email must be less than 256 characters"),
  phone: z.string().min(1, "Phone is required"),
  created_at: z.date(),
  updated_at: z.date(),
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
  start_date: event_schema.shape.start_date,
  end_date: event_schema.shape.end_date,
  location: z.string().min(1).max(256),
};

export const create_event_input = z.object(event_input_fields);

export const update_event_input = z.object({
  id: event_schema.shape.id,
  ...event_input_fields,
});

export const add_flyer_input = flyer_schema.pick({
  event_id: true,
  image: true,
  type: true,
});

export const update_flyer_input = flyer_schema.pick({
  id: true,
  image: true,
  type: true,
});

export const add_minister_input = z.object({
  event_id: z.number().int(),
  first_name: z.string().min(1).max(256),
  last_name: z.string().min(1).max(256),
  title: z.string().min(1).max(256),
  image: z.string(),
});

export const update_minister_input = z.object({
  id: z.number().int(),
  event_id: z.number().int(),
  first_name: z.string().min(1).max(256),
  last_name: z.string().min(1).max(256),
  title: z.string().min(1).max(256),
  image: z.string(),
});

export const add_reservation_input = reservation_schema.pick({
  event_id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone: true,
});

export const update_reservation_input = reservation_schema.pick({
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone: true,
});

export const delete_event_input = z.object({
  id: z.number().int(),
});

export const delete_flyer_input = z.object({
  id: z.number().int(),
});

export const get_event_input = z.object({
  id: z.number().int(),
});

export const list_events_input = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.string().regex(/^\d+$/).nullable().default(null),
});
