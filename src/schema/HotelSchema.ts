import { z } from "zod";

export const createHotelSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(1, { message: "Hotel name must be greater than 1 characters!" }),
        address: z
            .string()
            .min(1, { message: "Address must be greater than 4 characters!" }),
        location: z
            .string()
            .min(1, { message: "Hotel name must be greater than 1 characters!" }),
        description: z
            .string()
            .min(1, { message: "Hotel name must be greater than 1 characters!" }),
    }),
});

export const updateHotelSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z
        .object({
            username: z
                .string()
                .min(1, { message: "Username must be greater than 1 characters!" }),
            email: z
                .string()
                .min(4, { message: "Email must be greater than 4 characters!" }),
        })
        .partial(),
});