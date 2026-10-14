import z from "zod";

export const contact_enum = z.enum(["general", "prayer", "counseling"]);

export const contact_schema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z
    .email("Invalid email address")
    .max(256, "Email must be less than 256 characters"),
  phone: z.string().min(1, "Phone is required"),
  message: z.string().min(1, "Message is required"),
  for: contact_enum.default("general"),
  attendedTo: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
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
  firstName: z.string().min(1).max(256),
  lastName: z.string().min(1).max(256),
  email: z.email().max(256),
  phone: z.string().min(1),
  message: z.string().min(1),
  for: contact_enum.default("general"),
  attendedTo: z.boolean().default(false),
});

export const update_contact_input = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1).max(256),
  lastName: z.string().min(1).max(256),
  email: z.email().max(256),
  phone: z.string().min(1),
  message: z.string().min(1),
  for: contact_enum,
  attendedTo: z.boolean(),
});

export const delete_contact_input = z.object({
  id: z.string().uuid(),
});

export const list_contacts_input = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.uuid().nullable().default(null),
});
