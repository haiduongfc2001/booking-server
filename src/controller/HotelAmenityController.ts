import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { HotelAmenity } from "../model/HotelAmenity";

class HotelAmenityController {
  async createHotelAmenity(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;
      const { amenity } = req.body;

      const newAmenity = await HotelAmenity.create({
        hotel_id,
        amenity,
      });

      return res.status(201).json({
        status: 201,
        message: "Hotel amenity created successfully!",
        data: newAmenity,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelAmenities(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;
      const amenities = await HotelAmenity.findAll({
        where: { hotel_id },
      });
      return res.status(200).json({
        status: 200,
        data: amenities,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelAmenityById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const amenity = await HotelAmenity.findByPk(id);
      if (!amenity) {
        return res.status(404).json({
          status: 404,
          message: "Tạo dịch vụ với thành công!",
        });
      }
      return res.status(200).json({
        status: 200,
        data: amenity,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateHotelAmenity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amenity } = req.body;

      const hotelAmenity = await HotelAmenity.findByPk(id);
      if (!hotelAmenity) {
        return res.status(404).json({
          status: 404,
          message: "Hotel amenity not found!",
        });
      }

      hotelAmenity.amenity = amenity ?? hotelAmenity.amenity; // Update only if the value is provided
      await hotelAmenity.save();

      return res.status(200).json({
        status: 200,
        message: "Hotel amenity updated successfully!",
        data: hotelAmenity,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteHotelAmenity(req: Request, res: Response) {
    try {
      const { hotel_id, amenity_id } = req.params;
      const amenity = await HotelAmenity.findOne({
        where: {
          id: amenity_id,
          hotel_id,
        },
      });

      if (!amenity) {
        return res.status(404).json({
          status: 404,
          message: "Hotel amenity not found!",
        });
      }
      await amenity.destroy();
      return res.status(200).json({
        status: 200,
        message: "Xóa dịch vụ thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new HotelAmenityController();
