import { z } from "zod";
import { GENDER, STAFF_ROLE } from "../config/enum.config";

export const createStaffSchema = z.object({
  body: z.object({
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
          GENDER.MALE || value === GENDER.FEMALE || value === GENDER.OTHER,
        {
          message: "Gender must be male, female or other",
        }
      ),
    // phone: z.string().length(10, { message: "Phone must be 10 characters" }),
    // hotel_id: z.union([z.string(), z.number()])
    //     .refine(value => {
    //         if (typeof value === 'number') return true;
    //         return /^\d+$/.test(value);
    //     }),
    role: z
      .string()
      .refine(
        (value) =>
          value === STAFF_ROLE.MANAGER || value === STAFF_ROLE.RECEPTIONIST,
        {
          message: "Role name must be manager or receptionist!",
        }
      ),
    // avatar: z.string(),
  }),
});

export const updateStaffSchema = z.object({
  params: z.object({ staff_id: z.string() }),
  body: z
    .object({
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
            value === GENDER.MALE ||
            value === GENDER.FEMALE ||
            value === GENDER.OTHER,
          {
            message: "Gender must be male, female or other",
          }
        ),
      phone: z.string().length(10, { message: "Phone must be 10 characters" }),
      // hotel_id: z.union([z.string(), z.number()])
      //     .refine(value => {
      //         if (typeof value === 'number') return true;
      //         return /^\d+$/.test(value);
      //     }),
      role: z
        .string()
        .refine(
          (value) =>
            value === STAFF_ROLE.MANAGER || value === STAFF_ROLE.RECEPTIONIST,
          {
            message: "Role name must be manager or receptionist!",
          }
        ),
      // avatar: z.string(),
    })
    .partial(),
});
