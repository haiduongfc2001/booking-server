import { Request, Response } from "express";
import { RoomImageRepo } from "../repository/RoomImageRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { RoomImage } from "../model/RoomImage";

class RoomImageController {
    async getImagesByRoomId(req: Request, res: Response) {
        try {
            const hotel_id = parseInt(req.params.hotel_id);
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
}

export default new RoomImageController()
