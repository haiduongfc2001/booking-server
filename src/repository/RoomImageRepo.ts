import { RoomImage } from "../model/RoomImage";
import { ValidationError } from "sequelize";

interface IRoomImageRepo {
    getUrlsByRoomId(room_id: number): Promise<{ id: number, url: string }[]>;
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
}
