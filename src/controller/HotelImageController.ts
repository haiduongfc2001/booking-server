import { Request, Response } from "express";
import { HotelImageRepo } from "../repository/HotelImageRepo";
import { HotelImage } from "../model/HotelImage";
import generateRandomString from "../utils/RandomString";
import { minioClient } from "../config/minio";
import { Hotel } from "../model/Hotel";
import { DEFAULT_MINIO } from "../config/constant";

class HotelImageController {
    // Function to handle creation of a new hotel image
    async create(req: Request, res: Response) {
        try {
            // Check if files are uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    status: 400,
                    error: 'No files uploaded!'
                });
            }

            // Check if the hotel_id exists in the hotel table
            const hotel_id = req.body.hotel_id;
            const hotelExists = await Hotel.findByPk(hotel_id);
            if (!hotelExists) {
                return res.status(404).json({
                    status: 404,
                    message: 'Hotel not found!'
                });
            }

            const files = req.files as Express.Multer.File[];

            for (const file of files) {
                // Define the folder or path within the bucket
                const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`;

                // Upload the file to MinIO server with specified object name
                const metaData = { 'Content-Type': file.mimetype };
                const objectName = `${folder}/${Date.now()}_${generateRandomString(10)}_${file.originalname}`;
                await minioClient.putObject(DEFAULT_MINIO.BUCKET, objectName, file.buffer, metaData);

                // Generate URL for the uploaded file
                const fileUrl = await minioClient.presignedGetObject(DEFAULT_MINIO.BUCKET, objectName);

                // Create a new HotelImage object with hotel_id and fileUrl
                const new_hotel_image = new HotelImage({
                    hotel_id: hotel_id,
                    url: fileUrl
                });

                // Save the new HotelImage object to the database
                await new_hotel_image.save();
            }

            // Respond with success message
            res.status(201).json({
                status: 201,
                message: "Successfully created new hotel images!",
            });
        } catch (error) {
            // Handle error if any
            console.error("Error creating hotel images:", error);
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }

    // Function to fetch all hotel image data
    async findAll(req: Request, res: Response) {
        try {
            // Retrieve all hotel image data from the repository
            const new_hotel_image = await new HotelImageRepo().retrieveAll();

            // Respond with success message and data
            res.status(200).json({
                status: 200,
                message: "Successfully fetched all hotel image data!",
                data: new_hotel_image,
            });
        } catch (err) {
            // Handle error if any
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }

    async getUrlsByHotelId(req: Request, res: Response) {
        try {
            const hotel_id = req.params.hotel_id;
            const hotelExists = await Hotel.findByPk(hotel_id);
            if (!hotelExists) {
                return res.status(404).json({
                    status: 404,
                    message: 'Hotel not found!'
                });
            }

            const hotelImageRepo = new HotelImageRepo();
            const urls = await hotelImageRepo.getUrlsByHotelId(hotel_id);

            res.status(200).json({
                status: 200,
                message: "Successfully fetched URLs by hotel_id",
                data: urls,
            });
        } catch (error) {
            console.error("Error fetching URLs by hotel_id:", error);
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }

    async deleteImagesByHotelId(req: Request, res: Response) {
        try {
            // Extract hotel_id from request parameters
            const hotel_id = req.params.hotel_id;
            const hotelExists = await Hotel.findByPk(hotel_id);
            if (!hotelExists) {
                return res.status(404).json({
                    status: 404,
                    message: 'Hotel not found!'
                });
            }

            // Instantiate HotelImageRepo to access its methods
            const hotelImageRepo = new HotelImageRepo();

            // Delete hotel images from the database
            await hotelImageRepo.deleteImagesByHotelId(hotel_id);

            // List objects (images) from MinIO server corresponding to the hotel_id
            const objectsList: any[] = [];
            const objectsStream = minioClient.listObjectsV2(DEFAULT_MINIO.BUCKET, `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`, true);

            // Collect objects (images) into objectsList
            objectsStream.on('data', obj => objectsList.push(obj.name));

            // Handle stream errors
            objectsStream.on('error', e => {
                console.error(e);
                res.status(500).json({
                    status: 500,
                    message: "Internal Server Error!"
                });
            });

            // After collecting objects, remove them from MinIO server
            objectsStream.on('end', () => {
                minioClient.removeObjects(DEFAULT_MINIO.BUCKET, objectsList, function (e) {
                    if (e) {
                        console.error('Unable to remove Objects ', e);
                        return res.status(500).json({
                            status: 500,
                            message: "Internal Server Error!"
                        });
                    }
                    console.log('Removed the objects successfully');
                    // Respond with success message
                    res.status(200).json({
                        status: 200,
                        message: "Successfully deleted images by hotel_id"
                    });
                });
            });
        } catch (error) {
            // Handle error if any
            console.error("Error deleting images by hotel_id:", error);
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }
}

export default new HotelImageController()
