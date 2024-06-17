import { Request, Response } from "express";
import { RoomType } from "../model/RoomType";
import { Bed } from "../model/Bed";

export class BedController {
  // Create a new bed
  static async createBed(req: Request, res: Response) {
    try {
      const { room_type_id, type, description, quantity } = req.body;
      const roomType = await RoomType.findByPk(room_type_id);

      if (!roomType) {
        return res.status(404).json({ message: "Loại phòng không tồn tại!" });
      }

      const newBed = await Bed.create({
        room_type_id,
        type,
        description,
        quantity,
      });

      return res.status(201).json({
        status: 201,
        message: "Tạo giường thành công!",
        newBed,
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ!", error });
    }
  }

  // Get all beds
  static async getAllBeds(req: Request, res: Response) {
    try {
      const beds = await Bed.findAll({ include: [RoomType] });
      return res.status(200).json(beds);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ!", error });
    }
  }

  // Get a single bed by ID
  static async getBedById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bed = await Bed.findByPk(id, { include: [RoomType] });

      if (!bed) {
        return res.status(404).json({ message: "Giường không tồn tại!" });
      }

      return res.status(200).json(bed);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ!", error });
    }
  }

  // Update a bed
  static async updateBed(req: Request, res: Response) {
    try {
      const { bed_id } = req.params;
      const { room_type_id, type, description, quantity } = req.body;

      const bed = await Bed.findByPk(bed_id);

      if (!bed) {
        return res.status(404).json({ message: "Giường không tồn tại!" });
      }

      bed.room_type_id = room_type_id;
      bed.type = type;
      bed.description = description;
      bed.quantity = quantity;

      await bed.save();

      return res.status(200).json({
        status: 200,
        message: "Cập nhật thành công!",
        bed,
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ!", error });
    }
  }

  // Delete a bed
  static async deleteBed(req: Request, res: Response) {
    try {
      const { bed_id } = req.params;
      const bed = await Bed.findByPk(bed_id);

      if (!bed) {
        return res.status(404).json({ message: "Giường không tồn tại!" });
      }

      await bed.destroy();

      return res.status(200).json({
        status: 200,
        message: "Xóa giường thành công!",
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ!", error });
    }
  }
}
