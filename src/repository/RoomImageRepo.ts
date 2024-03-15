import { RoomImage } from "../model/RoomImage";
import { ValidationError } from "sequelize";

interface IRoomImageRepo {
    getUrlsByRoomId(roomId: number): Promise<{ id: number, url: string }[]>;
}

export class RoomImageRepo implements IRoomImageRepo {
    async getUrlsByRoomId(roomId: number): Promise<{ id: number, url: string }[]> {
        try {
            const roomImages = await RoomImage.findAll({
                where: {
                    room_id: roomId
                },
                attributes: ['id', 'url']
            });
            return roomImages.map(image => ({
                id: image.id,
                url: image.url
            }));
        } catch (error: any) {
            throw new Error("Failed to get URLs by roomId: " + error.message);
        }
    }
}
