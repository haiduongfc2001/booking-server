import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { Promotion } from "../model/Promotion";
import { Op } from "sequelize";
import { RoomType } from "../model/RoomType";
import dayjs from "dayjs";

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

  async getAllPromotionsByRoomTypeId(req: Request, res: Response) {
    try {
      const { room_type_id } = req.params;

      const promotions = await Promotion.findAll({
        where: {
          room_type_id,
        },
        order: [["start_date", "asc"]],
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all promotion data!",
        data: promotions,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getPromotionById(req: Request, res: Response) {
    try {
      const room_type_id = parseInt(req.params.room_type_id);
      const promotion_id = parseInt(req.params.promotion_id);

      const existingPromotion = await Promotion.findOne({
        where: {
          id: promotion_id,
          room_type_id,
        },
      });

      if (!existingPromotion) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khuyến mãi!",
        });
      }

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched promotion by id ${promotion_id}!`,
        data: existingPromotion,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async createPromotion(req: Request, res: Response) {
    try {
      const room_type_id = parseInt(req.params.room_type_id);
      const {
        code,
        discount_type,
        discount_value,
        start_date,
        end_date,
        is_active,
      } = req.body;

      // Validate input values
      if (
        !code ||
        !discount_type ||
        !discount_value ||
        !start_date ||
        !end_date
      ) {
        return res.status(400).json({
          status: 400,
          message: "Vui lòng cung cấp đầy đủ thông tin cho khuyến mãi!",
        });
      }

      // Convert discount_value to float if it's a string
      const parsedDiscountValue = parseInt(discount_value);

      // Check if room type exists
      const existingRoomType = await RoomType.findByPk(room_type_id);
      if (!existingRoomType) {
        return res.status(400).json({
          status: 400,
          message: "Không tìm thấy thông tin loại phòng!",
        });
      }

      // Check if room type exists
      const existingPromotionCode = await Promotion.findOne({
        where: {
          code,
          room_type_id,
        },
      });
      if (!existingPromotionCode) {
        return res.status(400).json({
          status: 400,
          message: "Mã giảm giá đã tồn tại!",
        });
      }

      // Check if there is any overlapping promotion for the same room type
      const overlappingPromotion = await Promotion.findOne({
        where: {
          room_type_id,
          [Op.or]: [
            {
              start_date: {
                [Op.between]: [start_date, end_date],
              },
            },
            {
              end_date: {
                [Op.between]: [start_date, end_date],
              },
            },
            {
              start_date: {
                [Op.lte]: start_date,
              },
              end_date: {
                [Op.gte]: end_date,
              },
            },
          ],
        },
      });

      if (overlappingPromotion) {
        return res.status(400).json({
          status: 400,
          message:
            "Thời gian khuyến mãi trùng với một khuyến mãi khác của loại phòng này!",
        });
      }

      // Create new promotion
      const newPromotion = await Promotion.create({
        room_type_id,
        code,
        discount_type,
        discount_value: parsedDiscountValue,
        start_date,
        end_date,
        is_active,
      });

      return res.status(201).json({
        status: 201,
        message: "Tạo khuyến mãi mới thành công!",
        data: newPromotion,
      });
    } catch (error) {
      console.error("Error creating promotion:", error);
      return res.status(500).json({
        status: 500,
        message: "Đã xảy ra lỗi khi tạo khuyến mãi!",
      });
    }
  }

  async createMultiplePromotions(req: Request, res: Response) {
    try {
      const room_type_id = parseInt(req.params.room_type_id);
      const promotions = req.body.promotions;

      const existingRoomType = await RoomType.findByPk(room_type_id);
      if (!existingRoomType) {
        return res.status(400).json({
          status: 400,
          message: "Không tìm thấy khách sạn!",
        });
      }

      // Validate each promotion
      for (const promotion of promotions) {
        const { type, value, description } = promotion;

        const existingPromotion = await Promotion.findOne({
          where: {
            type,
            room_type_id,
          },
        });

        if (existingPromotion) {
          return res.status(400).json({
            status: 400,
            message: `Chính sách với loại ${type} đã tồn tại!`,
          });
        }
      }

      // Create multiple promotions
      const newPromotions = await Promotion.bulkCreate(
        promotions.map((promotion: Promotion) => ({
          ...promotion,
          room_type_id,
        }))
      );

      return res.status(201).json({
        status: 201,
        message: "Tạo nhiều khuyến mãi mới thành công!",
        data: newPromotions,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updatePromotion(req: Request, res: Response) {
    try {
      const room_type_id = parseInt(req.params.room_type_id);
      const promotion_id = parseInt(req.params.promotion_id);

      const promotionToUpdate = await Promotion.findOne({
        where: {
          id: promotion_id,
          room_type_id,
        },
      });

      if (!promotionToUpdate) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khuyến mãi!",
        });
      }

      const fieldsToUpdate = [
        "code",
        "discount_type",
        "discount_value",
        "start_date",
        "end_date",
        "is_active",
      ];
      const updatedFields: any = {};

      fieldsToUpdate.forEach((field) => {
        if (req.body[field] !== undefined) {
          updatedFields[field] = req.body[field];
        }
      });

      if (req.body?.room_type_id) {
        const newRoomTypeId = parseInt(req.body.room_type_id);
        const roomType = await RoomType.findByPk(newRoomTypeId);

        if (!roomType) {
          return res.status(404).json({
            status: 404,
            message: "Không tìm thấy loại phòng!",
          });
        }
        updatedFields.room_type_id = newRoomTypeId;
      }

      // Kiểm tra thời gian
      if (updatedFields.start_date && updatedFields.end_date) {
        const startDate = dayjs(updatedFields.start_date);
        const endDate = dayjs(updatedFields.end_date);

        if (startDate.isAfter(endDate)) {
          return res.status(400).json({
            status: 400,
            message: "Thời gian bắt đầu phải trước thời gian kết thúc!",
          });
        }

        const conflictingPromotions = await Promotion.findAll({
          where: {
            room_type_id: updatedFields.room_type_id || room_type_id,
            id: { [Op.ne]: promotion_id },
            [Op.or]: [
              {
                start_date: {
                  [Op.between]: [startDate.toDate(), endDate.toDate()],
                },
              },
              {
                end_date: {
                  [Op.between]: [startDate.toDate(), endDate.toDate()],
                },
              },
              {
                start_date: { [Op.lte]: startDate.toDate() },
                end_date: { [Op.gte]: endDate.toDate() },
              },
            ],
          },
        });

        if (conflictingPromotions.length > 0) {
          return res.status(400).json({
            status: 400,
            message: "Khuyến mãi đã tồn tại trong khoảng thời gian này!",
          });
        }
      }

      await Promotion.update(updatedFields, {
        where: {
          id: promotion_id,
          room_type_id,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Cập nhật khuyến mãi thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deletePromotion(req: Request, res: Response) {
    try {
      const room_type_id = parseInt(req.params.room_type_id);
      const promotion_id = parseInt(req.params.promotion_id);

      const existingPromotion = await Promotion.findOne({
        where: {
          id: promotion_id,
          room_type_id,
        },
      });

      if (!existingPromotion) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khuyến mãi!",
        });
      }

      await existingPromotion.destroy();

      return res.status(200).json({
        status: 200,
        message: "Xóa khuyến mãi thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new PromotionController();
