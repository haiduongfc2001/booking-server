import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { RoomTypeAmenity } from "../model/RoomTypeAmenity";
import { where } from "sequelize";

class RoomTypeAmenityController {
  async createRoomTypeAmenity(req: Request, res: Response) {
    try {
      const { room_type_id } = req.params;
      const { amenity } = req.body;

      const newAmenity = await RoomTypeAmenity.create({
        room_type_id,
        amenity,
      });

      return res.status(201).json({
        status: 201,
        message: "Thêm tiện nghi mới thành công!",
        data: newAmenity,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getRoomTypeAmenities(req: Request, res: Response) {
    try {
      const { room_type_id } = req.params;
      const amenities = await RoomTypeAmenity.findAll({
        where: { room_type_id },
      });
      return res.status(200).json({
        status: 200,
        data: amenities,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getRoomTypeAmenityById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const amenity = await RoomTypeAmenity.findByPk(id);
      if (!amenity) {
        return res.status(404).json({
          status: 404,
          message: "RoomType amenity not found!",
        });
      }
      return res.status(200).json({
        status: 200,
        message: "Tiện ích đã được tạo thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateRoomTypeAmenity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amenity } = req.body;

      const roomTypeAmenity = await RoomTypeAmenity.findByPk(id);
      if (!roomTypeAmenity) {
        return res.status(404).json({
          status: 404,
          message: "RoomType amenity not found!",
        });
      }

      if (amenity !== undefined) {
        roomTypeAmenity.amenity = amenity;
      }
      await roomTypeAmenity.save();

      return res.status(200).json({
        status: 200,
        message: "RoomType amenity updated successfully!",
        data: roomTypeAmenity,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteRoomTypeAmenity(req: Request, res: Response) {
    try {
      const { room_type_id, amenity_id } = req.params;
      const amenity = await RoomTypeAmenity.findOne({
        where: {
          id: amenity_id,
          room_type_id,
        },
      });

      if (!amenity) {
        return res.status(404).json({
          status: 404,
          message: "RoomType amenity not found!",
        });
      }

      await amenity.destroy();
      return res.status(200).json({
        status: 200,
        message: "Tiện ích đã được xóa thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new RoomTypeAmenityController();
