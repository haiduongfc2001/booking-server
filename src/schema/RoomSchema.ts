import { z } from "zod";
import { ROOM_STATUS } from "../config/enum.config";

export const createRoomSchema = z.object({
  body: z.object({
    number: z
      .string()
      .min(1, { message: "Room number must be at least 1 character long!" }),
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
      number: z
        .string()
        .min(1, { message: "Room number must be at least 1 character long!" }),
      description: z
        .string()
        .min(1, { message: "Description must be at least 1 character long!" }),
      status: z
        .enum([ROOM_STATUS.AVAILABLE, ROOM_STATUS.UNAVAILABLE])
        .optional(),
    })
    .partial(),
});
