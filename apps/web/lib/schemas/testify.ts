import { z } from "zod/v4";

// Note: File validation in Zod can be tricky, especially on the client side.
// We'll use a relatively loose type here and handle the actual files in the submit handler.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
  phone: z
    .string()
    .min(5, "Please enter a valid phone number (WhatsApp).")
    .max(20, "Phone number must be at most 20 characters."),
  testimony: z
    .string()
    .trim()
    .min(10, "Testimony must be at least 10 characters.")
    .max(5000, "Testimony must be at most 5000 characters."),
  images: z
    .any()
    .optional(), // Handled by standard input type="file" multiple
});

export type TestifyFormValues = z.infer<typeof testifyFormSchema>;
