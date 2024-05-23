import { z } from "zod";

export const createHotelSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Hotel name must be greater than 1 characters!" }),
    street: z
      .string()
      .min(1, { message: "Street must be greater than 1 characters!" }),
    ward: z
      .string()
      .min(1, { message: "Ward must be greater than 1 characters!" }),
    district: z
      .string()
      .min(1, { message: "District must be greater than 1 characters!" }),
    province: z
      .string()
      .min(1, { message: "Province must be greater than 1 characters!" }),
    description: z
      .string()
      .min(1, { message: "Hotel name must be greater than 1 characters!" }),
    contact: z.string().length(10, { message: "Phone must be 10 characters" }),
  }),
});

export const updateHotelSchema = z.object({
  params: z.object({ hotel_id: z.string() }),
  body: z
    .object({
      name: z
        .string()
        .min(1, { message: "Hotel name must be greater than 1 characters!" }),
      street: z
        .string()
        .min(1, { message: "Street must be greater than 1 characters!" }),
      ward: z
        .string()
        .min(1, { message: "Ward must be greater than 1 characters!" }),
      district: z
        .string()
        .min(1, { message: "District must be greater than 1 characters!" }),
      province: z
        .string()
        .min(1, { message: "Province must be greater than 1 characters!" }),
      latitude: z
        .string()
        .min(1, { message: "Latitude must be greater than 1 characters!" }),
      longitude: z
        .string()
        .min(1, { message: "Longitude must be greater than 1 characters!" }),
      description: z
        .string()
        .min(1, { message: "Hotel name must be greater than 1 characters!" }),
      contact: z
        .string()
        .length(10, { message: "Phone must be 10 characters" }),
    })
    .partial(),
});
