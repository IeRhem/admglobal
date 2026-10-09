import z from "zod";

export const contact_enum = z.enum(["general", "prayer", "counseling"]);

export const contact_schema = z.object({
  id: z.number().int(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z
    .email("Invalid email address")
    .max(256, "Email must be less than 256 characters"),
  phone: z.string().min(1, "Phone is required"),
  message: z.string().min(1, "Message is required"),
  for: contact_enum.default("general"),
  attended_to: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
});

export type contact = z.infer<typeof contact_schema>;

// Output schemas
export const contact_output = contact_schema;

export const contact_list_output = z.object({
  contacts: z.array(contact_output),
  total: z.number(),
  next_cursor: z.string().nullable(),
});

// Input schemas
export const create_contact_input = z.object({
  first_name: z.string().min(1).max(256),
  last_name: z.string().min(1).max(256),
  email: z.email().max(256),
  phone: z.string().min(1),
  message: z.string().min(1),
  for: contact_enum.default("general"),
  attended_to: z.boolean().default(false),
});

export const update_contact_input = z.object({
  id: z.number().int(),
  first_name: z.string().min(1).max(256),
  last_name: z.string().min(1).max(256),
  email: z.email().max(256),
  phone: z.string().min(1),
  message: z.string().min(1),
  for: contact_enum,
  attended_to: z.boolean(),
});

export const delete_contact_input = z.object({
  id: z.number().int(),
});

export const list_contacts_input = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.string().regex(/^\d+$/).nullable().default(null),
});
