import { Request, Response } from "express";
import { RoomRepo } from "../repository/RoomRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { Room } from "../model/Room";
import { RoomType } from "../model/RoomType";

class RoomController {
  async getAllRooms(req: Request, res: Response) {
    try {
      const roomsData = await new RoomRepo().retrieveAll();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all room data!",
        data: roomsData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async createRoom(req: Request, res: Response) {
    try {
      // const hotel_id = parseInt(req.params?.hotel_id);
      const room_type_id = parseInt(req.params?.room_type_id);
      const { number, description } = req.body;

      const existingRoomType = await RoomType.findOne({
        where: {
          id: room_type_id,
          // hotel_id,
        },
      });

      if (!existingRoomType) {
        return res.status(404).json({
          status: 404,
          message: "Room Type not found!",
        });
      }

      const existingRoomNumber = await Room.findOne({
        where: {
          room_type_id,
          number,
        },
      });

      if (existingRoomNumber) {
        return res.status(400).json({
          status: 400,
          message: `Số phòng đã tồn tại trong loại phòng ${existingRoomType.name}!`,
        });
      }

      const newRoom = new Room({
        room_type_id,
        number,
        description,
      });

      await new RoomRepo().save(newRoom);

      res.status(201).json({
        status: 201,
        message: "Tạo mới phòng thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      // const hotel_id = parseInt(req.params.hotel_id);
      const room_type_id = parseInt(req.params.room_type_id);
      const room_id = parseInt(req.params.room_id);

      const room = await Room.findOne({
        where: {
          id: room_id,
          room_type_id,
        },
      });

      if (!room) {
        return res.status(404).json({
          status: 404,
          message: "Room not found!",
        });
      }

      await new RoomRepo().delete(room_id);

      return res.status(200).json({
        status: 200,
        message: "Successfully deleted room!",
      });
    } catch (error) {
      if (error instanceof Error) {
        return ErrorHandler.handleServerError(res, error.message);
      } else {
        return ErrorHandler.handleServerError(
          res,
          "An unknown error occurred."
        );
      }
    }
  }

  async getRoomById(req: Request, res: Response) {
    try {
      const room_type_id = parseInt(req.params.room_type_id);
      const room_id = parseInt(req.params.room_id);

      const room = await Room.findOne({
        where: {
          id: room_id,
          room_type_id,
        },
      });

      if (!room) {
        return res.status(404).json({
          status: 404,
          message: "Room not found!",
        });
      }

      const roomInfo = await new RoomRepo().retrieveById(room_id);

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched room by id ${room_id}!`,
        data: roomInfo,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateRoom(req: Request, res: Response) {
    try {
      const room_type_id = parseInt(req.params.room_type_id);
      const room_id = parseInt(req.params.room_id);

      const room = await Room.findOne({
        where: {
          id: room_id,
          room_type_id,
        },
      });

      if (!room) {
        return res.status(404).json({
          status: 404,
          message: "Room not found!",
        });
      }

      const fieldsToUpdate = [
        // "room_type_id",
        "number",
        "description",
        // "status",
      ];

      // Create an updated hotel object
      const updatedRoomData: Partial<Room> = {};
      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) {
          (updatedRoomData as any)[field] = req.body[field];
        }
      });

      await Room.update(updatedRoomData, { where: { id: room_id } });

      return res.status(200).json({
        status: 200,
        message: "Successfully updated room data!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new RoomController();
