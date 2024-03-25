import { RoomImage } from "../model/RoomImage";
import { ValidationError } from "sequelize";

interface IRoomImageRepo {
    getUrlsByRoomId(room_id: number): Promise<{ id: number, url: string }[]>;
    deleteImage(room_image_id: number): Promise<void>;
    deleteImages(imagesToDelete: Array<string>): Promise<void>;
}

export class RoomImageRepo implements IRoomImageRepo {
    async getUrlsByRoomId(room_id: number): Promise<{ id: number, url: string }[]> {
        try {
            const roomImages = await RoomImage.findAll({
                where: {
                    room_id: room_id
                },
                attributes: ['id', 'url']
            });
            return roomImages.map(image => ({
                id: image.id,
                url: image.url
            }));
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
