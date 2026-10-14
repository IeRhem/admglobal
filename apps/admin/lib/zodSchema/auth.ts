import z from "zod";

export const LoginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const SignupFormSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Passwords must match"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormType = z.infer<typeof LoginFormSchema>;
export type SignupFormType = z.infer<typeof SignupFormSchema>;
