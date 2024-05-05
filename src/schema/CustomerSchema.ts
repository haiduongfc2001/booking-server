import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(1, { message: "Username must be greater than 1 characters!" }),
    email: z
      .string()
      .email({ message: "Email is invalid!" })
      .min(4, { message: "Email must be greater than 4 characters!" }),
    password: z.string().refine((value) => !value || value.length >= 8, {
      message:
        "Password must be greater than or equal to 8 characters when not null",
    }),
    full_name: z
      .string()
      .min(1, { message: "Full name must be greater than 1 characters!" }),
    gender: z
      .string()
      .refine(
        (value) => value === "male" || value === "female" || value === "other",
        {
          message: "Gender must be male, female or other",
        }
      ),
    phone: z.string().length(10, { message: "Phone must be 10 characters" }),
    // dob: z.string(),
    // avatar: z.string(),
    // address: z.string(),
    // location: z.string(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({ customer_id: z.string() }),
  body: z
    .object({
      username: z
        .string()
        .min(1, { message: "Username must be greater than 1 characters!" }),
      email: z
        .string()
        .email({ message: "Email is invalid!" })
        .min(4, { message: "Email must be greater than 4 characters!" }),
      password: z.string().refine((value) => !value || value.length >= 8, {
        message:
          "Password must be greater than or equal to 8 characters when not null",
      }),
      full_name: z
        .string()
        .min(1, { message: "Full name must be greater than 1 characters!" }),
      gender: z
        .string()
        .refine(
          (value) =>
            value === "male" || value === "female" || value === "other",
          {
            message: "Gender must be male, female or other",
          }
        ),
      phone: z.string().length(10, { message: "Phone must be 10 characters" }),
      // dob: z.string(),
      // avatar: z.string(),
      // address: z.string(),
      // location: z.string(),
    })
    .partial(),
});
