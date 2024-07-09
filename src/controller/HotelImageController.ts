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
  async createHotelImages(req: Request, res: Response) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: 400,
          error: "No files uploaded!",
        });
      }

      const hotel_id = req.params.hotel_id;
      const hotelExists = await Hotel.findByPk(hotel_id);
      if (!hotelExists) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`;
      let index = 0;

      const files = req.files as Express.Multer.File[];

      for (const file of files) {
        const metaData = { "Content-Type": file.mimetype };
        const typeFile = getFileType(file.originalname);
        const newName = `${Date.now()}_${generateRandomString(16)}.${typeFile}`;
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

        const caption = req.body?.captions[index];
        const is_primary = req.body?.is_primarys[index];

        const newHotelImage = new HotelImage({
          hotel_id,
          url: newName,
          caption,
          is_primary,
        });

        index++;

        const hotelImage = await newHotelImage.save();

        if (is_primary !== undefined) {
          if (is_primary === true || is_primary === "true") {
            await HotelImage.update(
              { is_primary: false },
              {
                where: {
                  hotel_id,
                  id: { [Op.ne]: hotelImage.id },
                },
              }
            );
          }
          hotelImage.is_primary = is_primary;
        }
      }

      res.status(201).json({
        status: 201,
        message: "Successfully created new hotel images!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
  async createHotelImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 400,
          error: "No files uploaded!",
        });
      }

      const hotel_id = req.params.hotel_id;
      const hotelExists = await Hotel.findByPk(hotel_id);
      if (!hotelExists) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`;

      const file = req.file as Express.Multer.File;

      const metaData = { "Content-Type": file.mimetype };
      const typeFile = getFileType(file.originalname);
      const newName = `${Date.now()}_${generateRandomString(16)}.${typeFile}`;
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

      const caption = req.body?.caption;
      const is_primary = req.body?.is_primary;

      const newHotelImage = new HotelImage({
        hotel_id,
        url: newName,
        caption,
        is_primary,
      });

      const hotelImage = await newHotelImage.save();

      if (is_primary !== undefined) {
        if (is_primary === true || is_primary === "true") {
          await HotelImage.update(
            { is_primary: false },
            {
              where: {
                hotel_id,
                id: { [Op.ne]: hotelImage.id },
              },
            }
          );
        }
        hotelImage.is_primary = is_primary;
      }

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
          message: "Không tìm thấy khách sạn!",
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
      const hotel_id = req.params.hotel_id;
      const hotelExists = await Hotel.findByPk(hotel_id);
      if (!hotelExists) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const hotelImageRepo = new HotelImageRepo();

      await hotelImageRepo.deleteAll(hotel_id);

      const objectsList: any[] = [];
      const objectsStream = minioConfig
        .getClient()
        .listObjectsV2(
          DEFAULT_MINIO.BUCKET,
          `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`,
          true
        );

      objectsStream.on("data", (obj) => objectsList.push(obj.name));

      objectsStream.on("error", (e) => {
        ErrorHandler.handleServerError(res, e);
      });

      objectsStream.on("end", () => {
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

            return res.status(200).json({
              status: 200,
              message: "Xóa ảnh khách sạn thành công!",
            });
          });
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateImagesByHotelId(req: Request, res: Response) {
    try {
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
          message: "Không tìm thấy khách sạn!",
        });
      }

      const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`;

      if (Array.isArray(deleteImages) && deleteImages.length > 0) {
        const objectsList: string[] = [];

        for await (const id of deleteImages) {
          const hotelImage = await HotelImage.findByPk(id);
          if (hotelImage) {
            const modifiedUrl = `${folder}/${hotelImage.url}`;
            objectsList.push(modifiedUrl);
          }
        }

        await minioConfig
          .getClient()
          .removeObjects(DEFAULT_MINIO.BUCKET, objectsList);

        const hotelImageRepo = new HotelImageRepo();
        await hotelImageRepo.deleteImages(deleteImages);
      }

      let index = 0;

      if (Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];

        for (const file of files) {
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

          const caption = req.body?.captions[index];
          const is_primary = req.body?.is_primarys[index];

          const newHotelImage = new HotelImage({
            hotel_id,
            url: newName,
            caption,
            is_primary,
          });

          index++;

          await newHotelImage.save();

          const hotelImage = await newHotelImage.save();

          if (is_primary !== undefined) {
            if (is_primary === true || is_primary === "true") {
              await HotelImage.update(
                { is_primary: false },
                {
                  where: {
                    hotel_id,
                    id: { [Op.ne]: hotelImage.id },
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
            continue;
          }

          if (imageCaption !== null && imageCaption !== "") {
            hotelImage.caption = imageCaption;
          }

          await hotelImage.save();
        }
      }

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
          hotel_id,
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
          await HotelImage.update(
            { is_primary: false },
            {
              where: {
                hotel_id,
                id: { [Op.ne]: hotel_image_id },
              },
            }
          );
        }
        hotel_image.is_primary = is_primary;
      }

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
          hotel_id,
        },
      });

      if (!hotel_image) {
        return res.status(404).json({
          status: 404,
          message: "Hotel Image not found!",
        });
      }

      minioConfig
        .getClient()
        .removeObject(
          DEFAULT_MINIO.BUCKET,
          `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${hotel_image.url}`
        );

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
