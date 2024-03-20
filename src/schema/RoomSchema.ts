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
            .number()
            .min(0, { message: "Price must be a positive number!" }),
        discount: z
            .number()
            .min(0, { message: "Discount must be a positive number or zero!" }),
        capacity: z
            .number()
            .min(1, { message: "Capacity must be a positive number!" }),
        description: z
            .string()
            .min(1, { message: "Description must be at least 1 character long!" }),
        status: z
            .enum(["available", "unavailable"])
            .optional()
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
                .number()
                .min(0, { message: "Price must be a positive number!" }),
            discount: z
                .number()
                .min(0, { message: "Discount must be a positive number or zero!" }),
            capacity: z
                .number()
                .min(1, { message: "Capacity must be a positive number!" }),
            description: z
                .string()
                .min(1, { message: "Description must be at least 1 character long!" }),
            status: z
                .enum(["available", "unavailable"])
                .optional()
        })
        .partial(),
});