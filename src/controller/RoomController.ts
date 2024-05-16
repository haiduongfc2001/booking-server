import { Request, Response } from "express";
import { RoomRepo } from "../repository/RoomRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { Room } from "../model/Room";
import { Hotel } from "../model/Hotel";
import { DEFAULT_MINIO } from "../config/constant.config";
import { minioConfig } from "../config/minio.config";
import generateRandomString from "../utils/RandomString";
import { RoomImage } from "../model/RoomImage";
import getFileType from "../utils/GetFileType";

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
      const hotel_id = parseInt(req.params?.hotel_id);
      const {
        name,
        number,
        type,
        price,
        adult_occupancy,
        child_occupancy,
        description,
        status,
      } = req.body;
      const room_number = req.body?.number;

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Hotel not found!",
        });
      }

      const existingRoomNumber = await Room.findOne({
        where: {
          hotel_id: hotel_id,
          number: room_number,
        },
      });

      if (existingRoomNumber) {
        return res.status(400).json({
          status: 400,
          message: "Room number already exists!",
        });
      }

      const newRoom = new Room({
        hotel_id,
        name,
        number,
        type,
        price: Number(price),
        adult_occupancy: Number(adult_occupancy),
        child_occupancy: Number(child_occupancy),
        description,
        status,
      });

      await new RoomRepo().save(newRoom);

      const savedRoom = await Room.findOne({
        where: {
          hotel_id: newRoom.hotel_id,
          number: newRoom.number,
        },
      });

      if (req.files && savedRoom) {
        const room_id = savedRoom.id;
        const hotel_id = savedRoom.hotel_id;

        // Define the folder or path within the bucket
        const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room_id}`;
        let index = 0;

        const files = req.files as Express.Multer.File[];

        for (const file of files) {
          // Upload the file to MinIO server with specified object name
          const metaData = { "Content-Type": file.mimetype };
          const typeFile = getFileType(file.originalname);
          const newName = `${Date.now()}_${generateRandomString(
            16
          )}.${typeFile}`;
          const objectName = `${folder}/${newName}`;
          await minioConfig
            .getClient()
            .putObject(DEFAULT_MINIO.BUCKET, objectName, file.buffer, metaData);

          // Create a new RoomImage object with room_id, fileUrl, caption, and is_primary
          const newRoomImage = new RoomImage({
            room_id: room_id,
            url: newName,
            caption: req.body?.captions[index],
            is_primary: req.body?.is_primarys[index],
          });

          // Increment index
          index++;

          // Save the new RoomImage object to the database
          await newRoomImage.save();
        }
      }

      res.status(201).json({
        status: 201,
        message: "Successfully created room!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const room_id = parseInt(req.params.room_id);

      const room = await Room.findOne({
        where: {
          id: room_id,
          hotel_id: hotel_id,
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
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getRoomById(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const room_id = parseInt(req.params.room_id);

      const room = await Room.findOne({
        where: {
          id: room_id,
          hotel_id: hotel_id,
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
      const hotel_id = parseInt(req.params.hotel_id);
      const room_id = parseInt(req.params.room_id);

      const room = await Room.findOne({
        where: {
          id: room_id,
          hotel_id: hotel_id,
        },
      });

      if (!room) {
        return res.status(404).json({
          status: 404,
          message: "Room not found!",
        });
      }

      const fieldsToUpdate = [
        "number",
        "type",
        "price",
        "description",
        "status",
      ];

      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) {
          (room as any)[field] = req.body[field];
        }
      });

      await new RoomRepo().update(room);

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
