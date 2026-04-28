import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must have at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must have at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().trim().min(8, "Enter a valid phone number"),
    password: z.string().min(6, "Password must have at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
