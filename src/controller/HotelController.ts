import { Request, Response } from "express";
import { Hotel } from "../model/Hotel";
import { HotelRepo } from "../repository/HotelRepo";
import { minioClient } from "../config/minio";
import generateRandomString from "../utils/RandomString";
import { DEFAULT_MINIO } from "../config/constant";
import ErrorHandler from "../utils/ErrorHandler";
import { StaffRepo } from "../repository/StaffRepo";
import { RoomRepo } from "../repository/RoomRepo";

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

            res.status(200).json({
                status: 200,
                message: `Successfully fetched hotel by id ${hotel_id}!`,
                data: existingHotel,
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
}

export default new HotelController()