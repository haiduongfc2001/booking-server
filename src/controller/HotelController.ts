import { Request, Response } from "express";
import { Hotel } from "../model/Hotel";
import { HotelRepo } from "../repository/HotelRepo";
import { minioClient } from "../config/minio";
import generateRandomString from "../utils/RandomString";
import { DEFAULT_MINIO } from "../config/constant";
import ErrorHandler from "../utils/ErrorHandler";
import { Staff } from "../model/Staff";
import { StaffRepo } from "../repository/StaffRepo";

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
            let id = parseInt(req.params["id"]);

            const existingHotel = await Hotel.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingHotel) {
                return res.status(404).json({
                    status: 404,
                    message: "Hotel not found!",
                });
            }

            await new HotelRepo().delete(id);

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
            let id = parseInt(req.params["id"]);

            const existingHotel = await Hotel.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingHotel) {
                return res.status(404).json({
                    status: 404,
                    message: "Hotel not found!",
                });
            }

            const newHotel = await new HotelRepo().retrieveById(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched hotel by id ${id}!`,
                data: newHotel,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getStaffByHotelId(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);

            const existingHotel = await Hotel.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingHotel) {
                return res.status(404).json({
                    status: 404,
                    message: "Hotel not found!",
                });
            }

            const staffs = await new StaffRepo().retrieveAllStaffByHotelId(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched staff by hotel id ${id}!`,
                data: staffs,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
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
            const id = parseInt(req.params["id"]);
            const hotelToUpdate = await Hotel.findByPk(id);

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

            await hotelToUpdate.save();

            res.status(200).json({
                status: 200,
                message: "Successfully updated hotel data!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }


    // API endpoint for uploading hotel photos
    async uploadHotelPhoto(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 400, error: 'No file uploaded'
                });
            }

            const file = req.file;

            // Upload file to MinIO server
            const metaData = { 'Content-Type': file.mimetype };
            const objectName = `${Date.now()}_${generateRandomString(10)}_${file.originalname}`;
            await minioClient.putObject(DEFAULT_MINIO.BUCKET, objectName, file.buffer, metaData);

            // Generate URL for uploaded file
            const fileUrl = await minioClient.presignedGetObject(DEFAULT_MINIO.BUCKET, objectName);

            return res.status(200).json({ url: fileUrl });
        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

}

export default new HotelController()