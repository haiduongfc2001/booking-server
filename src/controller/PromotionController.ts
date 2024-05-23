import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { Promotion } from "../model/Promotion";
import { Op } from "sequelize";

class PromotionController {
  async checkStatus(req: Request, res: Response) {
    try {
      const currentDate = new Date();

      // Update is_active field based on the current date
      await Promotion.update(
        { is_active: true },
        {
          where: {
            start_date: { [Op.lte]: currentDate },
            end_date: { [Op.gte]: currentDate },
          },
        }
      );

      // Set is_active to false for promotions where the current date is outside the validity period
      await Promotion.update(
        { is_active: false },
        {
          where: {
            [Op.or]: [
              { start_date: { [Op.gt]: currentDate } },
              { end_date: { [Op.lt]: currentDate } },
            ],
          },
        }
      );

      // Retrieve all promotions after updating is_active field
      const promotions = await Promotion.findAll();

      const promotionStatus: Record<number, boolean> = {};

      // Set isActive status based on the is_active field
      promotions.forEach((promotion) => {
        promotionStatus[promotion.id] = promotion.is_active;
      });

      // Send the promotion status as JSON response
      res.status(200).json(promotionStatus);
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new PromotionController();
