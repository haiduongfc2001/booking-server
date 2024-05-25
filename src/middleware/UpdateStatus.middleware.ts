import { Request, Response, NextFunction } from "express";
import * as updateStatuses from "../helper/updateStatuses";

export const updateRoomStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateStatuses.updateRoomStatus();
    next();
  } catch (error) {
    console.error("Error updating statuses:", error);
    res.status(500).json({ message: "Failed to update statuses" });
  }
};
