import { z } from "zod/v4";

export const testifyFormSchema = z.object({
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
  testimony: z
    .string()
    .trim()
    .min(20, "Testimony must be at least 20 characters.")
    .max(5000, "Testimony must be at most 5000 characters."),
});

export type TestifyFormValues = z.infer<typeof testifyFormSchema>;
