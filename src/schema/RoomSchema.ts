import { z } from "zod";

export const createRoomSchema = z.object({
  body: z.object({
    number: z
      .string()
      .min(1, { message: "Room number must be at least 1 character long!" }),
    type: z
      .string()
      .min(1, { message: "Type must be at least 1 character long!" }),
    price: z
      .string()
      .or(z.number())
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine(
        (val) => {
          return typeof val === "number" && val >= 0;
        },
        { message: "Price must be a positive number!" }
      ),
    adult_occupancy: z
      .string()
      .or(z.number())
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine(
        (val) => {
          return typeof val === "number" && val >= 1;
        },
        { message: "Capacity must be a positive number!" }
      ),
    child_occupancy: z
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
    status: z.enum(["available", "unavailable"]).optional(),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({ room_id: z.string() }),
  body: z
    .object({
      number: z
        .string()
        .min(1, { message: "Room number must be at least 1 character long!" }),
      type: z
        .string()
        .min(1, { message: "Type must be at least 1 character long!" }),
      price: z
        .string()
        .or(z.number())
        .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
        .refine(
          (val) => {
            return typeof val === "number" && val >= 0;
          },
          { message: "Price must be a positive number!" }
        ),
      adult_occupancy: z
        .string()
        .or(z.number())
        .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
        .refine(
          (val) => {
            return typeof val === "number" && val >= 1;
          },
          { message: "Capacity must be a positive number!" }
        ),
      child_occupancy: z
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
      status: z.enum(["available", "unavailable"]).optional(),
    })
    .partial(),
});
