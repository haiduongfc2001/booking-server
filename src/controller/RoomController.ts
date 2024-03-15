import { Request, Response } from "express";
import { RoomRepo } from "../repository/RoomRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { Room } from "../model/Room";
import { Hotel } from "../model/Hotel";

class RoomController {
    async getAllRooms(req: Request, res: Response) {
        try {
            const roomsData = await new RoomRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all room data!",
                data: roomsData,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async createRoom(req: Request, res: Response) {
        try {

            const existingHotel = await Hotel.findOne({
                where: {
                    id: req.body.hotel_id,
                }
            })

            if (!existingHotel) {
                return res.status(404).json({
                    status: 404,
                    message: "Hotel not found!",
                });
            }

            const newRoom = new Room();
            newRoom.hotel_id = req.body.hotel_id;
            newRoom.number = req.body.number;
            newRoom.type = req.body.type;
            newRoom.price = req.body.price;
            newRoom.discount = req.body.discount;
            newRoom.capacity = req.body.capacity;
            newRoom.description = req.body.description;
            newRoom.status = req.body.status;

            await new RoomRepo().save(newRoom);

            res.status(201).json({
                status: 201,
                message: "Successfully created room!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async deleteRoom(req: Request, res: Response) {
        let id = parseInt(req.params["id"]);

        const existingRoom = await Room.findOne({
            where: {
                id: id,
            }
        })

        if (!existingRoom) {
            return res.status(404).json({
                status: 404,
                message: "Room not found!",
            });
        }

        await new RoomRepo().delete(id);

        res.status(200).json({
            status: 200,
            message: "Successfully deleted hotel!",
        });
    }
}

export default new RoomController()