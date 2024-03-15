import { Request, Response } from "express";
import { RoomImageRepo } from "../repository/RoomImageRepo";
import { Room } from "../model/Room";
import ErrorHandler from "../utils/ErrorHandler";

class RoomImageController {
    async getImagesByRoomId(req: Request, res: Response) {
        try {
            let roomId = parseInt(req.params["roomId"]);
            const roomExists = await Room.findByPk(roomId);
            if (!roomExists) {
                return res.status(404).json({
                    status: 404,
                    message: 'Room not found!'
                });
            }

            const roomImageRepo = new RoomImageRepo();
            const urls = await roomImageRepo.getUrlsByRoomId(roomId);

            res.status(200).json({
                status: 200,
                message: "Successfully fetched URLs by room_id",
                data: urls,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new RoomImageController()
