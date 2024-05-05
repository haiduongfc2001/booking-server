import { z } from "zod";

export const createHotelImageSchema = z.object({
  body: z.object({
    hotel_id: z.union([z.number(), z.string()]).refine(
      (value) => {
        if (typeof value === "number") {
          return value > 0;
        } else if (typeof value === "string") {
          return value.trim().length > 0;
        }
        return false;
      },
      {
        message:
          "Invalid hotel ID. The ID must be a number or non-empty string.",
      }
    ),
  }),
});
