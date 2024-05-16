import { Request, Response } from "express";
import { HotelImageRepo } from "../repository/HotelImageRepo";
import { HotelImage } from "../model/HotelImage";
import generateRandomString from "../utils/RandomString";
import { minioConfig } from "../config/minio.config";
import { Hotel } from "../model/Hotel";
import { DEFAULT_MINIO } from "../config/constant.config";
import ErrorHandler from "../utils/ErrorHandler";
import { Op } from "sequelize";
import getFileType from "../utils/GetFileType";

class HotelImageController {
	// Function to handle creation of a new hotel image
	async createHotelImages(req: Request, res: Response) {
		try {
			// Check if files are uploaded
			if (!req.files || req.files.length === 0) {
				return res.status(400).json({
					status: 400,
					error: "No files uploaded!",
				});
			}

			// Check if the hotel_id exists in the hotel table
			const hotel_id = req.params.hotel_id;
			const hotelExists = await Hotel.findByPk(hotel_id);
			if (!hotelExists) {
				return res.status(404).json({
					status: 404,
					message: "Hotel not found!",
				});
			}

			// Define the folder or path within the bucket
			const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`;
			let index = 0;

			const files = req.files as Express.Multer.File[];

			for (const file of files) {
				// Upload the file to MinIO server with specified object name
				const metaData = { "Content-Type": file.mimetype };
				// `${folder}/${Date.now()}_${generateRandomString(16)}_${file.originalname.replace(/\s/g, '')}`
				const typeFile = getFileType(file.originalname);
				const newName = `${Date.now()}_${generateRandomString(16)}.${typeFile}`;
				const objectName = `${folder}/${newName}`;

				await minioConfig
					.getClient()
					.putObject(DEFAULT_MINIO.BUCKET, objectName, file.buffer, metaData);

				const caption = req.body?.captions[index];
				const is_primary = req.body?.is_primarys[index];

				// Create a new HotelImage object with hotel_id, fileUrl, caption, and is_primary
				const newHotelImage = new HotelImage({
					hotel_id: hotel_id,
					url: newName,
					caption,
					is_primary,
				});

				// Increment index
				index++;

				// Save the new HotelImage object to the database
				const hotelImage = await newHotelImage.save();

				if (is_primary !== undefined) {
					if (is_primary === true || is_primary === "true") {
						// Set all is_primary to false for other room_images with the same room_id
						await HotelImage.update(
							{ is_primary: false },
							{
								where: {
									hotel_id: hotel_id,
									id: { [Op.ne]: hotelImage.id }, // Exclude the current room_image
								},
							}
						);
					}
					hotelImage.is_primary = is_primary;
				}
			}

			// Respond with success message
			res.status(201).json({
				status: 201,
				message: "Successfully created new hotel images!",
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async getImagesByHotelId(req: Request, res: Response) {
		try {
			const hotel_id = req.params.hotel_id;

			const hotelExists = await Hotel.findByPk(hotel_id);
			if (!hotelExists) {
				return res.status(404).json({
					status: 404,
					message: "Hotel not found!",
				});
			}

			const hotelImageRepo = new HotelImageRepo();
			const urls = await hotelImageRepo.getUrlsByHotelId(hotel_id);

			return res.status(200).json({
				status: 200,
				message: "Successfully fetched URLs by hotel_id",
				data: urls,
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
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
					message: "Hotel not found!",
				});
			}

			// Instantiate HotelImageRepo to access its methods
			const hotelImageRepo = new HotelImageRepo();

			// Delete hotel images from the database
			await hotelImageRepo.deleteAll(hotel_id);

			// List objects (images) from MinIO server corresponding to the hotel_id
			const objectsList: any[] = [];
			const objectsStream = minioConfig
				.getClient()
				.listObjectsV2(
					DEFAULT_MINIO.BUCKET,
					`${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`,
					true
				);

			// Collect objects (images) into objectsList
			objectsStream.on("data", (obj) => objectsList.push(obj.name));

			// Handle stream errors
			objectsStream.on("error", (e) => {
				ErrorHandler.handleServerError(res, e);
			});

			// After collecting objects, remove them from MinIO server
			objectsStream.on("end", () => {
				minioConfig
					.getClient()
					.removeObjects(DEFAULT_MINIO.BUCKET, objectsList, function (e) {
						if (e) {
							console.error("Unable to remove Objects ", e);
							return res.status(500).json({
								status: 500,
								message: "Unable to remove Objects!",
							});
						}

						// Respond with success message
						return res.status(200).json({
							status: 200,
							message: "Successfully deleted images by hotel_id",
						});
					});
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async updateImagesByHotelId(req: Request, res: Response) {
		try {
			// Extract hotel_id from request parameters
			const hotel_id = req.params.hotel_id;
			const {
				deleteImages,
				captions,
				is_primarys,
				image_ids,
				captions_update,
			} = req.body;

			const hotelExists = await Hotel.findByPk(hotel_id);
			if (!hotelExists) {
				return res.status(404).json({
					status: 404,
					message: "Hotel not found!",
				});
			}

			const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`;

			// Check if deleteImages is provided in the request and it's an array
			if (Array.isArray(deleteImages) && deleteImages.length > 0) {
				// List objects (images) from MinIO server corresponding to the hotel_id
				const objectsList: string[] = []; // Specify the type as string[]
				// const objectsStream = minioConfig.getClient().listObjectsV2(DEFAULT_MINIO.BUCKET, `${folder}`, true);

				// Collect objects to be deleted
				for await (const id of deleteImages) {
					const hotelImage = await HotelImage.findByPk(id);
					if (hotelImage) {
						const modifiedUrl = `${folder}/${hotelImage.url}`;
						objectsList.push(modifiedUrl);
					}
				}

				// Remove objects from MinIO server
				await minioConfig
					.getClient()
					.removeObjects(DEFAULT_MINIO.BUCKET, objectsList);

				// Delete images from the database
				const hotelImageRepo = new HotelImageRepo();
				await hotelImageRepo.deleteImages(deleteImages);
			}

			// Define the folder or path within the bucket
			let index = 0;

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
					await minioConfig
						.getClient()
						.putObject(DEFAULT_MINIO.BUCKET, objectName, file.buffer, metaData);

					const caption = req.body?.captions[index];
					const is_primary = req.body?.is_primarys[index];

					// Create a new HotelImage object with hotel_id and fileUrl
					const newHotelImage = new HotelImage({
						hotel_id: hotel_id,
						url: newName,
						caption,
						is_primary,
					});

					// Increment index
					index++;

					// Save the new HotelImage object to the database
					await newHotelImage.save();

					// Save the new HotelImage object to the database
					const hotelImage = await newHotelImage.save();

					if (is_primary !== undefined) {
						if (is_primary === true || is_primary === "true") {
							// Set all is_primary to false for other room_images with the same room_id
							await HotelImage.update(
								{ is_primary: false },
								{
									where: {
										hotel_id: hotel_id,
										id: { [Op.ne]: hotelImage.id }, // Exclude the current room_image
									},
								}
							);
						}
						hotelImage.is_primary = is_primary;
					}
				}
			}

			if (
				Array.isArray(req.body?.image_ids) &&
				req.body?.image_ids.length > 0
			) {
				const { image_ids, captions } = req.body;

				for (let i = 0; i < image_ids.length; i++) {
					const imageId = image_ids[i];
					const imageCaption = captions[i];

					let hotelImage = await HotelImage.findByPk(imageId);

					if (!hotelImage) {
						console.error(`HotelImage with ID ${imageId} not found.`);
						continue; // Skip to the next iteration if imageId is not found
					}

					// Update caption if it exists and is not empty or null
					if (imageCaption !== null && imageCaption !== "") {
						hotelImage.caption = imageCaption;
					}

					// Save the updated hotel image
					await hotelImage.save();
				}
			}

			// Respond with success message
			return res.status(200).json({
				status: 200,
				message: "Successfully updated images by hotel_id",
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async updateHotelImageById(req: Request, res: Response) {
		try {
			const hotel_id = parseInt(req.params.hotel_id);
			const hotel_image_id = parseInt(req.params.hotel_image_id);
			const { caption, is_primary } = req.body;

			const hotel_image = await HotelImage.findOne({
				where: {
					id: hotel_image_id,
					hotel_id: hotel_id,
				},
			});

			if (!hotel_image) {
				return res.status(404).json({
					status: 404,
					message: "Hotel Image not found!",
				});
			}

			if (caption !== undefined) {
				hotel_image.caption = caption;
			}

			if (is_primary !== undefined) {
				if (is_primary === true || is_primary === "true") {
					// Set all is_primary to false for other hotel_images with the same hotel_id
					await HotelImage.update(
						{ is_primary: false },
						{
							where: {
								hotel_id: hotel_id,
								id: { [Op.ne]: hotel_image_id }, // Exclude the current hotel_image
							},
						}
					);
				}
				hotel_image.is_primary = is_primary;
			}

			// Save hotel_image
			await hotel_image.save();

			return res.status(200).json({
				status: 200,
				message: "Hotel Image updated successfully!",
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async deleteHotelImageById(req: Request, res: Response) {
		try {
			const hotel_id = parseInt(req.params.hotel_id);
			const hotel_image_id = parseInt(req.params.hotel_image_id);

			const hotel_image = await HotelImage.findOne({
				where: {
					id: hotel_image_id,
					hotel_id: hotel_id,
				},
			});

			if (!hotel_image) {
				return res.status(404).json({
					status: 404,
					message: "Hotel Image not found!",
				});
			}

			// Remove the object from MinIO storage
			await minioConfig
				.getClient()
				.removeObject(
					DEFAULT_MINIO.BUCKET,
					`${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${hotel_image.url}`
				);

			// Delete the hotel image record from the database
			const hotelImageRepo = new HotelImageRepo();
			await hotelImageRepo.deleteImage(hotel_image_id);

			return res.status(200).json({
				status: 200,
				message: "Hotel Image deleted successfully!",
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}
}

export default new HotelImageController();
