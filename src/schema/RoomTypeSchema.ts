import { z } from "zod";
import { ROOM_STATUS } from "../config/enum.config";

export const createRoomSchema = z.object({
  body: z.object({
    base_price: z
      .string()
      .or(z.number())
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine(
        (val) => {
          return typeof val === "number" && val >= 0;
        },
        { message: "Price must be a positive number!" }
      ),
    standard_occupant: z
      .string()
      .or(z.number())
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine(
        (val) => {
          return typeof val === "number" && val >= 1;
        },
        { message: "Capacity must be a positive number!" }
      ),
    max_children: z
      .string()
      .or(z.number())
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine(
        (val) => {
          return typeof val === "number" && val >= 0;
        },
        { message: "Capacity must be a positive number!" }
      ),
    description: z
      .string()
      .min(1, { message: "Description must be at least 1 character long!" }),
    status: z.enum([ROOM_STATUS.AVAILABLE, ROOM_STATUS.UNAVAILABLE]).optional(),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({ room_id: z.string() }),
  body: z
    .object({
      base_price: z
        .string()
        .or(z.number())
        .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
        .refine(
          (val) => {
            return typeof val === "number" && val >= 0;
          },
          { message: "Price must be a positive number!" }
        ),
      standard_occupant: z
        .string()
        .or(z.number())
        .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
        .refine(
          (val) => {
            return typeof val === "number" && val >= 1;
          },
          { message: "Capacity must be a positive number!" }
        ),
      max_children: z
        .string()
        .or(z.number())
        .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
        .refine(
          (val) => {
            return typeof val === "number" && val >= 0;
          },
          { message: "Capacity must be a positive number!" }
        ),
      description: z
        .string()
        .min(1, { message: "Description must be at least 1 character long!" }),
    })
    .partial(),
});
