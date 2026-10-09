import z from "zod";

export const testimonial_schema = z.object({
  id: z.number().int(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.email("Invalid email address").max(256).nullable(),
  message: z.string().min(20, "Message is required"),
  is_verified: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
});

export const testimonial_image_schema = z.object({
  id: z.number().int(),
  testimonial_id: z.number().int(),
  image: z.string().min(1, "Image is required"),
  created_at: z.date(),
  updated_at: z.date(),
});

export type testimonial = z.infer<typeof testimonial_schema>;
export type testimonial_image = z.infer<typeof testimonial_image_schema>;

// Output schemas

export const testimonial_output = testimonial_schema.extend({
  images: z.array(testimonial_image_schema),
});

export const testimonial_list_output = z.object({
  testimonies: z.array(testimonial_output),
  total: z.number(),
  next_cursor: z.string().nullable(),
});

// Input schemas
export const create_testimonial_input = z.object({
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
  message: z.string().min(20, "Message is required"),
});

export const update_testimonial_input = z.object({
  id: z.number().int(),
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
  message: z.string().min(20, "Message is required"),
  is_verified: z.boolean(),
});

export const add_testimonial_image_input = testimonial_image_schema.pick({
  testimonial_id: true,
  image: true,
});

export const delete_testimonial_input = z.object({
  id: z.number().int(),
});

export const delete_testimonial_image_input = z.object({
  id: z.number().int(),
});

export const get_testimonial_input = z.object({
  id: z.number().int(),
});

export const list_testimonies_input = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().regex(/^\d+$/).nullable().default(null),
  is_verified: z.boolean().default(true),
});