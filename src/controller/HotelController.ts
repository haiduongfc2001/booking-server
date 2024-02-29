import { Request, Response } from "express";
import { Hotel } from "../model/Hotel";
import { HotelRepo } from "../repository/HotelRepo";
import { minioClient } from "../config/minio";
import generateRandomString from "../utils/RandomString";

class HotelController {
    async create(req: Request, res: Response) {
        try {
            const new_hotel = new Hotel();
            new_hotel.name = req.body.name;
            new_hotel.address = req.body.address;
            new_hotel.location = req.body.location;
            new_hotel.description = req.body.description;

            await new HotelRepo().save(new_hotel);

            res.status(201).json({
                status: 201,
                message: "Successfully created hotel!",
            });
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }

    async delete(req: Request, res: Response) {
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
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }

    async findById(req: Request, res: Response) {
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

            const new_hotel = await new HotelRepo().retrieveById(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched hotel by id ${id}!`,
                data: new_hotel,
            });
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const new_hotel = await new HotelRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all hotel data!",
                data: new_hotel,
            });
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }

    async update(req: Request, res: Response) {
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
                'name', 'address', 'location', 'description'
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
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }


    // API endpoint for uploading hotel photos
    async uploadHotelPhoto(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const file = req.file;

            // Upload file to MinIO server
            const metaData = { 'Content-Type': file.mimetype };
            const objectName = `${Date.now()}_${generateRandomString(10)}_${file.originalname}`;
            await minioClient.putObject('europetrip', objectName, file.buffer, metaData);

            // Generate URL for uploaded file
            const fileUrl = await minioClient.presignedGetObject('europetrip', objectName);

            return res.status(200).json({ url: fileUrl });
        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

}

export default new HotelController()