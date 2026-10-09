import { z } from "zod/v4";

export const eventRegistrationSchema = z.object({
  eventId: z.string(),
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
});

export type EventRegistrationValues = z.infer<typeof eventRegistrationSchema>;
