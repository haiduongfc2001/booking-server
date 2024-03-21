import { Request, Response } from "express";
import { RoomImageRepo } from "../repository/RoomImageRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { RoomImage } from "../model/RoomImage";
import { Room } from "../model/Room";
import { DEFAULT_MINIO } from "../config/constant";
import { minioClient } from "../config/minio";
import generateRandomString from "../utils/RandomString";

class RoomImageController {
    async getImagesByRoomId(req: Request, res: Response) {
        try {
            const room_id = parseInt(req.params.room_id);

            const image = await RoomImage.findOne({
                where: {
                    room_id: room_id
                }
            });

            if (!image) {
                return res.status(404).json({
                    status: 404,
                    message: 'Image not found!'
                });
            }

            const roomImageRepo = new RoomImageRepo();
            const urls = await roomImageRepo.getUrlsByRoomId(room_id);

            return res.status(200).json({
                status: 200,
                message: "Successfully fetched Images by room_id",
                data: urls,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async createRoomImages(req: Request, res: Response) {
        try {
            // Check if files are uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    status: 400,
                    error: 'No files uploaded!'
                });
            }

            // Check if the room_id exists in the room table
            const hotel_id = req.params.hotel_id;
            const room_id = req.params.room_id;
            const roomExists = await Room.findOne({
                where: {
                    id: room_id,
                    hotel_id: hotel_id
                }
            });
            if (!roomExists) {
                return res.status(404).json({
                    status: 404,
                    message: 'Room not found!'
                });
            }

            // Define the folder or path within the bucket
            const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room_id}`;
            let index = 0;

            const files = req.files as Express.Multer.File[];

            for (const file of files) {
                // Upload the file to MinIO server with specified object name
                const metaData = { 'Content-Type': file.mimetype };
                const objectName = `${folder}/${Date.now()}_${generateRandomString(10)}_${file.originalname.replace(/\s/g, '')}`;
                await minioClient.putObject(DEFAULT_MINIO.BUCKET, objectName, file.buffer, metaData);

                // Generate URL for the uploaded file
                const fileUrl = await minioClient.presignedGetObject(DEFAULT_MINIO.BUCKET, objectName);

                // Create a new RoomImage object with room_id, fileUrl, caption, and is_primary
                const newRoomImage = new RoomImage({
                    room_id: room_id,
                    url: fileUrl,
                    caption: req.body?.captions[index],
                    is_primary: req.body?.is_primarys[index],
                });

                // Increment index
                index++;

                // Save the new RoomImage object to the database
                await newRoomImage.save();
            }

            // Respond with success message
            res.status(201).json({
                status: 201,
                message: "Successfully created new room images!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new RoomImageController()
