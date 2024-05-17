import { Request, Response, NextFunction } from "express";
import { updateStatuses as updateStatusHelper } from "../helper/statusUpdater";

export const updateStatuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateStatusHelper();
    next();
  } catch (error) {
    console.error("Error updating statuses:", error);
    res.status(500).json({ message: "Failed to update statuses" });
  }
};
