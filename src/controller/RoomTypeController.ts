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
import { RoomType } from "../model/RoomType";
import { RoomTypeRepo } from "../repository/RoomTypeRepo";
import { Bed } from "../model/Bed";
import { RoomTypeAmenity } from "../model/RoomTypeAmenity";

class RoomTypeController {
  async getAllRoomTypes(req: Request, res: Response) {
    try {
      const roomTypesData = await RoomType.findAll();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all room type data!",
        data: roomTypesData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async createRoomType(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params?.hotel_id);
      const {
        name,
        description,
        base_price,
        standard_occupant,
        max_children,
        max_occupant,
        max_extra_bed = 0,
        views,
        area,
        free_breakfast,
      } = req.body;

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const newRoomType = new RoomType({
        hotel_id,
        name,
        description,
        base_price,
        standard_occupant,
        max_children,
        max_occupant,
        max_extra_bed,
        views,
        area,
        free_breakfast,
      });

      await new RoomTypeRepo().save(newRoomType);

      const savedRoomType = await RoomType.findOne({
        where: {
          hotel_id: newRoomType.hotel_id,
          name: newRoomType.name,
          description: newRoomType.description,
          base_price: newRoomType.base_price,
          standard_occupant: newRoomType.standard_occupant,
          max_children: newRoomType.max_children,
          max_occupant: newRoomType.max_occupant,
          max_extra_bed: newRoomType.max_extra_bed,
          views: newRoomType.views,
          area: newRoomType.area,
          free_breakfast: newRoomType.free_breakfast,
        },
      });

      if (req.files && savedRoomType) {
        const room_type_id = savedRoomType.id;

        // Define the folder or path within the bucket
        const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${room_type_id}`;
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
            .putObject(
              DEFAULT_MINIO.BUCKET,
              objectName,
              file.buffer,
              file.size,
              metaData
            );

          // Create a new RoomImage object with room_type_id, fileUrl, caption, and is_primary
          const newRoomImage = new RoomImage({
            room_type_id,
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
        message: "Tạo loại phòng mới thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteRoomType(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const room_type_id = parseInt(req.params.room_type_id);

      const roomType = await RoomType.findOne({
        where: {
          id: room_type_id,
          hotel_id,
        },
      });

      if (!roomType) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy dữ liệu!",
        });
      }

      const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${room_type_id}`;
      const deleteImages = await RoomImage.findAll({
        where: {
          room_type_id,
        },
      });

      // Delete room images
      if (deleteImages.length > 0) {
        const objectsList = await Promise.all(
          deleteImages.map(async (image) => {
            const modifiedUrl = `${folder}/${image.url}`;
            return modifiedUrl;
          })
        );

        minioConfig
          .getClient()
          .removeObjects(DEFAULT_MINIO.BUCKET, objectsList, function (e) {
            if (e) {
              console.error("Không thể xóa ảnh ", e);
              return res.status(500).json({
                status: 500,
                message: "Không thể xóa ảnh!",
              });
            }
          });
      }

      await new RoomTypeRepo().delete(room_type_id);

      return res.status(200).json({
        status: 200,
        message: "Xóa thành công!",
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

  async getRoomTypeById(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const room_type_id = parseInt(req.params.room_type_id);

      const roomType = await RoomType.findOne({
        where: {
          id: room_type_id,
          hotel_id: hotel_id,
        },
        include: [
          { model: Bed },
          { model: RoomImage },
          { model: Room },
          { model: RoomTypeAmenity },
        ],
      });

      if (!roomType) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy loại phòng!",
        });
      }

      const updatedImages = await Promise.all(
        roomType.roomImages.map(async (image) => {
          const presignedUrl = await new Promise<string>((resolve, reject) => {
            minioConfig
              .getClient()
              .presignedGetObject(
                DEFAULT_MINIO.BUCKET,
                `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${room_type_id}/${image.url}`,
                24 * 60 * 60,
                (err, presignedUrl) => {
                  if (err) reject(err);
                  else resolve(presignedUrl);
                }
              );
          });

          return {
            ...image.toJSON(),
            url: presignedUrl,
          };
        })
      );

      return res.status(200).json({
        status: 200,
        message: `Lấy dữ liệu loại phòng có id ${room_type_id} thành công!`,
        data: {
          ...roomType.toJSON(),
          totalRooms: roomType.rooms.length,
          roomImages: updatedImages,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateRoomType(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const room_type_id = parseInt(req.params.room_type_id);

      const roomType = await RoomType.findOne({
        where: {
          id: room_type_id,
          hotel_id,
        },
      });

      if (!roomType) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy dữ liệu!",
        });
      }

      const fieldsToUpdate = [
        "hotel_id",
        "name",
        "description",
        "base_price",
        "free_breakfast",
        "standard_occupant",
        "max_children",
        "max_occupant",
        "max_extra_bed",
        "views",
        "area",
      ];

      const updatedRoomTypeData: Partial<RoomType> = {};
      fieldsToUpdate.forEach((field) => {
        if (req.body.hasOwnProperty(field)) {
          (updatedRoomTypeData as any)[field] = req.body[field];
        }
      });

      await RoomType.update(updatedRoomTypeData, {
        where: { id: room_type_id, hotel_id },
      });

      return res.status(200).json({
        status: 200,
        message: "Cập nhật dữ liệu thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new RoomTypeController();
