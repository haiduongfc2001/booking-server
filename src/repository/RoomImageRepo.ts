import { DEFAULT_MINIO } from "../config/constant";
import { minioClient } from "../config/minio";
import { RoomImage } from "../model/RoomImage";

interface IRoomImageRepo {
    getUrlsByRoomId(hotel_id: number, room_id: number): Promise<{ id: number, url: string }[]>;
    deleteImage(room_image_id: number): Promise<void>;
    deleteImages(imagesToDelete: Array<string>): Promise<void>;
}

export class RoomImageRepo implements IRoomImageRepo {
    async getUrlsByRoomId(hotel_id: number, room_id: number): Promise<{ id: number, url: string }[]> {
        try {
            const roomImages = await RoomImage.findAll({
                where: {
                    room_id: room_id
                },
                attributes: ['id', 'url']
            });

            const folder = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room_id}`;

            const urlsWithPresignedUrls = await Promise.all(roomImages.map(async (image) => {
                const presignedUrl = await new Promise<string>((resolve, reject) => {
                    minioClient.presignedGetObject(DEFAULT_MINIO.BUCKET, `${folder}/${image.url}`, 24 * 60 * 60, (err, presignedUrl) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(presignedUrl);
                        }
                    });
                });
                return {
                    id: image.id,
                    url: presignedUrl,
                };
            }));

            return urlsWithPresignedUrls;
        } catch (error: any) {
            throw new Error("Failed to get URLs by room_id: " + error.message);
        }
    }

    async deleteImage(room_image_id: number): Promise<void> {
        try {
            await RoomImage.destroy({
                where: {
                    id: room_image_id
                }
            });
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    }

    async deleteImages(imagesToDelete: Array<string>): Promise<void> {
        try {
            for (const id of imagesToDelete) {
                await RoomImage.destroy({
                    where: {
                        id: id
                    }
                });
            }
        } catch (error) {
            console.error("Error deleting images:", error);
        }
    }
}
