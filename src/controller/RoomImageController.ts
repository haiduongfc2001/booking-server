import { Request, Response } from "express";
import { RoomImageRepo } from "../repository/RoomImageRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { RoomImage } from "../model/RoomImage";
import { Room } from "../model/Room";
import { DEFAULT_MINIO } from "../config/constant";
import { minioClient } from "../config/minio";
import generateRandomString from "../utils/RandomString";
import { Op } from "sequelize";
import getFileType from "../utils/GetFileType";

class RoomImageController {
	async getImagesByRoomId(req: Request, res: Response) {
		try {
			const hotel_id = parseInt(req.params.hotel_id);
			const room_id = parseInt(req.params.room_id);

			const image = await RoomImage.findOne({
				where: {
					room_id: room_id,
				},
			});

			if (!image) {
				return res.status(404).json({
					status: 404,
					message: "Image not found!",
				});
			}

			const roomImageRepo = new RoomImageRepo();
			const urls = await roomImageRepo.getUrlsByRoomId(hotel_id, room_id);

			return res.status(200).json({
				status: 200,
				message: "Successfully fetched Images by room_id",
				data: urls,
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async createRoomImage(req: Request, res: Response) {
		try {
			const { hotel_id, room_id } = req.params;
			const { caption, is_primary } = req.body;
			const file = req.file;

			if (!file) {
				return res.status(400).json({
					status: 400,
					message: "No file uploaded!",
				});
			}

			const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room_id}`;
			const metaData = { "Content-Type": file.mimetype };
			const typeFile = getFileType(file.originalname);
			const newName = `${Date.now()}_${generateRandomString(16)}.${typeFile}`;
			const objectName = `${folder}/${newName}`;

			await minioClient.putObject(
				DEFAULT_MINIO.BUCKET,
				objectName,
				file.buffer,
				metaData
			);

			// Create a new RoomImage object with room_id, fileUrl, caption, and is_primary
			const newRoomImage = new RoomImage({
				room_id: room_id,
				url: newName,
				caption: caption,
				is_primary: is_primary,
			});

			// Save the new RoomImage object to the database
			const roomImage = await newRoomImage.save();

			if (is_primary !== undefined) {
				if (is_primary === true || is_primary === "true") {
					// Set all is_primary to false for other room_images with the same room_id
					await RoomImage.update(
						{ is_primary: false },
						{
							where: {
								room_id: room_id,
								id: { [Op.ne]: roomImage.id }, // Exclude the current room_image
							},
						}
					);
				}
				roomImage.is_primary = is_primary;
			}

			res.status(201).json({
				status: 201,
				message: "Room Image created successfully!",
				data: newRoomImage,
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
					error: "No files uploaded!",
				});
			}

			// Check if the room_id exists in the room table
			const { hotel_id, room_id } = req.params;
			const roomExists = await Room.findOne({
				where: {
					id: room_id,
					hotel_id: hotel_id,
				},
			});
			if (!roomExists) {
				return res.status(404).json({
					status: 404,
					message: "Room not found!",
				});
			}

			// Define the folder or path within the bucket
			const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room_id}`;
			let index = 0;

			const files = req.files as Express.Multer.File[];

			for (const file of files) {
				// Upload the file to MinIO server with specified object name
				const metaData = { "Content-Type": file.mimetype };
				const typeFile = getFileType(file.originalname);
				const newName = `${Date.now()}_${generateRandomString(16)}.${typeFile}`;
				const objectName = `${folder}/${newName}`;

				await minioClient.putObject(
					DEFAULT_MINIO.BUCKET,
					objectName,
					file.buffer,
					metaData
				);

				const caption = req.body?.captions[index];
				const is_primary = req.body?.is_primarys[index];

				// Create a new RoomImage object with room_id and fileUrl
				const newRoomImage = new RoomImage({
					room_id: room_id,
					url: newName,
					caption,
					is_primary,
				});

				// Increment index
				index++;

				// Save the new HotelImage object to the database
				const roomImage = await newRoomImage.save();

				if (is_primary !== undefined) {
					if (is_primary === true || is_primary === "true") {
						// Set all is_primary to false for other room_images with the same room_id
						await RoomImage.update(
							{ is_primary: false },
							{
								where: {
									room_id: room_id,
									id: { [Op.ne]: roomImage.id }, // Exclude the current room_image
								},
							}
						);
					}
					roomImage.is_primary = is_primary;
				}
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

	async updateRoomImageById(req: Request, res: Response) {
		try {
			const room_id = parseInt(req.params.room_id);
			const room_image_id = parseInt(req.params.room_image_id);
			const { caption, is_primary } = req.body;

			const room_image = await RoomImage.findOne({
				where: {
					id: room_image_id,
					room_id: room_id,
				},
			});

			if (!room_image) {
				return res.status(404).json({
					status: 404,
					message: "Room Image not found!",
				});
			}

			if (caption !== undefined) {
				room_image.caption = caption;
			}

			if (is_primary !== undefined) {
				if (is_primary === true || is_primary === "true") {
					// Set all is_primary to false for other room_images with the same room_id
					await RoomImage.update(
						{ is_primary: false },
						{
							where: {
								room_id: room_id,
								id: { [Op.ne]: room_image_id }, // Exclude the current room_image
							},
						}
					);
				}
				room_image.is_primary = is_primary;
			}

			// Save room_image
			await room_image.save();

			return res.status(200).json({
				status: 200,
				message: "Room Image updated successfully!",
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async updateImagesByRoomId(req: Request, res: Response) {
		try {
			const { deleteImages, captions, is_primarys } = req.body;
			const { hotel_id, room_id } = req.params;

			// Check if the room_id exists in the room table
			const roomExists = await Room.findOne({
				where: {
					id: room_id,
					hotel_id: hotel_id,
				},
			});
			if (!roomExists) {
				return res.status(404).json({
					status: 404,
					message: "Room not found!",
				});
			}

			const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room_id}`;

			// Delete room images
			if (Array.isArray(deleteImages) && deleteImages.length > 0) {
				const objectsList: string[] = [];
				for await (const id of deleteImages) {
					const roomImage = await RoomImage.findByPk(id);
					if (roomImage) {
						const modifiedUrl = `${folder}/${roomImage.url}`;
						objectsList.push(modifiedUrl);
					}
				}

				await minioClient.removeObjects(DEFAULT_MINIO.BUCKET, objectsList);

				const roomImageRepo = new RoomImageRepo();
				await roomImageRepo.deleteImages(deleteImages);
			}

			// Define the folder or path within the bucket
			let index = 0;

			// Upload room images
			// Check if files are provided in the request
			if (Array.isArray(req.files) && req.files.length > 0) {
				const files = req.files as Express.Multer.File[];

				for (const file of files) {
					// Upload the file to MinIO server with specified object name
					const metaData = { "Content-Type": file.mimetype };
					const typeFile = getFileType(file.originalname);
					const newName = `${Date.now()}_${generateRandomString(
						16
					)}.${typeFile}`;
					const objectName = `${folder}/${newName}`;

					await minioClient.putObject(
						DEFAULT_MINIO.BUCKET,
						objectName,
						file.buffer,
						metaData
					);

					const caption = req.body?.captions[index];
					const is_primary = req.body?.is_primarys[index];

					// Create a new RoomImage object with room_id and fileUrl
					const newRoomImage = new RoomImage({
						room_id: room_id,
						url: newName,
						caption,
						is_primary,
					});

					// Increment index
					index++;

					// Save the new HotelImage object to the database
					const roomImage = await newRoomImage.save();

					if (is_primary !== undefined) {
						if (is_primary === true || is_primary === "true") {
							// Set all is_primary to false for other room_images with the same room_id
							await RoomImage.update(
								{ is_primary: false },
								{
									where: {
										room_id: room_id,
										id: { [Op.ne]: roomImage.id }, // Exclude the current room_image
									},
								}
							);
						}
						roomImage.is_primary = is_primary;
					}
				}
			}

			// Update caption of room image
			if (
				Array.isArray(req.body?.image_ids) &&
				req.body?.image_ids.length > 0
			) {
				const { image_ids, captions } = req.body;

				for (let i = 0; i < image_ids.length; i++) {
					const imageId = image_ids[i];
					const imageCaption = captions[i];

					let roomImage = await RoomImage.findByPk(imageId);

					if (!roomImage) {
						console.error(`RoomImage with ID ${imageId} not found.`);
						continue; // Skip to the next iteration if imageId is not found
					}

					// Update caption if it exists and is not empty or null
					if (imageCaption !== null && imageCaption !== "") {
						roomImage.caption = imageCaption;
					}

					// Save the updated room image
					await roomImage.save();
				}
			}

			// Respond with success message
			return res.status(200).json({
				status: 200,
				message: "Successfully updated images by room_id",
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async deleteRoomImageById(req: Request, res: Response) {
		try {
			const hotel_id = parseInt(req.params.hotel_id);
			const room_id = parseInt(req.params.room_id);
			const room_image_id = parseInt(req.params.room_image_id);

			const roomImage = await RoomImage.findOne({
				where: {
					id: room_image_id,
					room_id: room_id,
				},
			});

			if (!roomImage) {
				return res.status(404).json({
					status: 404,
					message: "Room Image not found!",
				});
			}

			const modifiedUrl = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room_id}/${roomImage.url}`;

			// Remove the object from MinIO storage
			await minioClient.removeObject(DEFAULT_MINIO.BUCKET, modifiedUrl);

			// Delete the room image record from the database
			const roomImageRepo = new RoomImageRepo();
			await roomImageRepo.deleteImage(room_image_id);

			return res.status(200).json({
				status: 200,
				message: "Room Image deleted successfully!",
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}
}

export default new RoomImageController();
