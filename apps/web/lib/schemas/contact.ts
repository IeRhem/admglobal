import { z } from "zod/v4";

export const contactTypes = ["prayer", "counseling", "inquiry"] as const;

export type ContactType = (typeof contactTypes)[number];

export const contactFormSchema = z.object({
  type: z.enum(contactTypes),
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be at most 50 characters."),
  email: z.email("Please enter a valid email address."),
  phone: z
    .string()
    .max(20, "Phone number must be at most 20 characters.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(1000, "Message must be at most 1000 characters."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
