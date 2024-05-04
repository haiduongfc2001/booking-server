import { Request, Response } from "express";
import { Hotel } from "../model/Hotel";
import { HotelRepo } from "../repository/HotelRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { StaffRepo } from "../repository/StaffRepo";
import { RoomRepo } from "../repository/RoomRepo";
import { Room } from "../model/Room";
import { Sequelize } from "sequelize-typescript";
import { HotelImage } from "../model/HotelImage";
import { db } from "../config/database";
import { QueryTypes } from 'sequelize';
import { minioClient } from "../config/minio";
import { DEFAULT_MINIO } from "../config/constant";

class HotelController {
  async createHotel(req: Request, res: Response) {
    try {
      const newHotel = new Hotel();
      newHotel.name = req.body.name;
      newHotel.address = req.body.address;
      newHotel.location = req.body.location;
      newHotel.description = req.body.description;
      newHotel.contact = req.body.contact;

      await new HotelRepo().save(newHotel);

      res.status(201).json({
        status: 201,
        message: "Successfully created hotel!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteHotel(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params["hotel_id"]);

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Hotel not found!",
        });
      }

      await new HotelRepo().delete(hotel_id);

      res.status(200).json({
        status: 200,
        message: "Successfully deleted hotel!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelById(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params?.hotel_id);

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Hotel not found!",
        });
      }

      const hotelInfo = await new HotelRepo().retrieveById(hotel_id)

      res.status(200).json({
        status: 200,
        message: `Successfully fetched hotel by id ${hotel_id}!`,
        data: hotelInfo,
      });

    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelDetail(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params?.hotel_id);

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Hotel not found!",
        });
      }

      const hotelImages = await HotelImage.findAll({
        where: {
          hotel_id: hotel_id,
        },
        order: [['id', 'asc']]
      });

      const roomListByHotelId = await new RoomRepo().retrieveAllRoomsByHotelId(hotel_id);

      const hotelInfo = {
        ...existingHotel.toJSON(),
        images: hotelImages.map(image => ({
          id: image.id,
          url: image.url,
          caption: image.caption,
          is_primary: image.is_primary,
        })),
        roomList: roomListByHotelId.map(room => ({
          id: room.id,
          number: room.number,
          type: room.type,
          price: room.price,
          discount: room.discount,
          capacity: room.capacity,
          description: room.description,
          rating_average: room.rating_average,
          status: room.status,
          images: room.images,
        }))
      };

      res.status(200).json({
        status: 200,
        message: `Successfully fetched hotel by id ${hotel_id}!`,
        data: hotelInfo,
      });

    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getStaffByHotelId(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params["hotel_id"]);

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Hotel not found!",
        });
      }

      const staffs = await new StaffRepo().retrieveAllStaffByHotelId(hotel_id);

      res.status(200).json({
        status: 200,
        message: `Successfully fetched staff by hotel id ${hotel_id}!`,
        data: staffs,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getRoomByHotelId(req: Request, res: Response) {
    const hotel_id = parseInt(req.params["hotel_id"]);

    const existingHotel = await Hotel.findByPk(hotel_id);

    if (!existingHotel) {
      return res.status(404).json({
        status: 404,
        message: "Hotel not found!",
      });
    }

    const rooms = await new RoomRepo().retrieveRoomByHotelId(hotel_id);

    res.status(200).json({
      status: 200,
      message: `Successfully fetched room by hotel id ${hotel_id}!`,
      data: rooms,
    });
  }


  async getAllHotels(req: Request, res: Response) {
    try {
      const hotelsData = await new HotelRepo().retrieveAll();

      res.status(200).json({
        status: 200,
        message: "Successfully fetched all hotel data!",
        data: hotelsData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelList(req: Request, res: Response) {
    try {
      const hotels = await new HotelRepo().retrieveAll();

      const hotelList = hotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
      }))

      res.status(200).json({
        status: 200,
        message: "Hotel list successfully retrieved!",
        data: hotelList,
      });
    } catch (error) {

    }
  }

  async updateHotel(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params["hotel_id"]);
      const hotelToUpdate = await Hotel.findByPk(hotel_id);

      if (!hotelToUpdate) {
        return res.status(404).json({
          status: 404,
          message: "Hotel not found!"
        });
      }

      const fieldsToUpdate = [
        'name', 'address', 'location', 'description', 'contact'
      ];

      fieldsToUpdate.forEach(field => {
        if (req.body[field]) {
          (hotelToUpdate as any)[field] = req.body[field];
        }
      });

      await new HotelRepo().update(hotelToUpdate);

      res.status(200).json({
        status: 200,
        message: "Successfully updated hotel data!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getOutstandingHotels(req: Request, res: Response) {
    try {
      const sequelize = db.sequelize;

      if (sequelize) {
        const query = `
        SELECT
          h.id AS hotel_id,
          h.name AS hotel_name,
          h.address AS hotel_address,
          (
            SELECT hi.url
            FROM hotel_image hi
            WHERE hi.hotel_id = h.id 
              AND hi.is_primary = true
            LIMIT 1
          ) AS hotel_avatar,
          MIN(r.price - r.discount) AS min_room_price,
          (
            SELECT r.price
            FROM (
                SELECT
                    r.price,
                    ROW_NUMBER() OVER (ORDER BY r.price - r.discount) AS rn
                FROM room r
                WHERE r.hotel_id = h.id
            ) r
            WHERE r.rn = 1
        ) AS original_room_price
        FROM
          hotel h
        JOIN
          room r ON h.id = r.hotel_id
        GROUP BY
          h.id, h.name, h.address;
      `;

        const hotels = await sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        const updatedHotels = await Promise.all(hotels.map(async (hotel: any) => {
          // Generate presigned URL for hotel avatar
          const presignedUrl = await new Promise<string>((resolve, reject) => {
            minioClient.presignedGetObject(DEFAULT_MINIO.BUCKET, `${DEFAULT_MINIO.HOTEL_PATH}/${hotel.hotel_id}/${hotel.hotel_avatar}`, 24 * 60 * 60, function (err, presignedUrl) {
              if (err) reject(err);
              else resolve(presignedUrl);
            });
          });

          // Return updated hotel object with presigned URL
          return {
            ...hotel,
            hotel_avatar: presignedUrl
          };
        }));


        res.status(200).json({
          status: 200,
          message: "Successfully fetched outstanding hotel data!",
          data: updatedHotels
        });
      }
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new HotelController();