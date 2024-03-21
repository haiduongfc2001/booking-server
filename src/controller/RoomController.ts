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

    async getAllRoomsByHotelId(req: Request, res: Response) {
        try {
            const hotel_id = parseInt(req.params?.hotel_id)

            const roomsData = await Room.findAll({
                where: {
                    hotel_id: hotel_id
                }
            });

            if (roomsData.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: "No rooms found for the specified hotel!",
                });
            }

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
            const hotel_id = parseInt(req.params?.hotel_id);

            const existingHotel = await Hotel.findByPk(hotel_id);

            if (!existingHotel) {
                return res.status(404).json({
                    status: 404,
                    message: "Hotel not found!",
                });
            }

            const newRoom = new Room();
            newRoom.hotel_id = hotel_id;
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
        const hotel_id = parseInt(req.params.hotel_id);
        const room_id = parseInt(req.params.room_id);

        const room = await Room.findOne({
            where: {
                id: room_id,
                hotel_id: hotel_id
            }
        });

        if (!room) {
            return res.status(404).json({
                status: 404,
                message: 'Room not found!'
            });
        }

        await new RoomRepo().delete(room_id);

        res.status(200).json({
            status: 200,
            message: "Successfully deleted hotel!",
        });
    }

    async getRoomById(req: Request, res: Response) {
        try {
            const hotel_id = parseInt(req.params.hotel_id);
            const room_id = parseInt(req.params.room_id);

            const room = await Room.findOne({
                where: {
                    id: room_id,
                    hotel_id: hotel_id
                }
            });

            if (!room) {
                return res.status(404).json({
                    status: 404,
                    message: 'Room not found!'
                });
            }

            res.status(200).json({
                status: 200,
                message: `Successfully fetched room by id ${room_id}!`,
                data: room,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async updateRoom(req: Request, res: Response) {
        try {
            const hotel_id = parseInt(req.params.hotel_id);
            const room_id = parseInt(req.params.room_id);

            const room = await Room.findOne({
                where: {
                    id: room_id,
                    hotel_id: hotel_id
                }
            });

            if (!room) {
                return res.status(404).json({
                    status: 404,
                    message: 'Room not found!'
                });
            }

            const fieldsToUpdate = [
                'number', 'type', 'price',
                'discount', 'capacity', 'description', 'status'
            ];

            fieldsToUpdate.forEach(field => {
                if (req.body[field]) {
                    (room as any)[field] = req.body[field];
                }
            });

            if (req.body?.hotel_id) {
                const hotel = await Hotel.findByPk(parseInt(req.body?.hotel_id));

                if (!hotel) {
                    return res.status(404).json({
                        status: 404,
                        message: "Hotel not found!"
                    });
                }
                room.hotel_id = req.body.hotel_id;
            }

            await new RoomRepo().update(room);

            res.status(200).json({
                status: 200,
                message: "Successfully updated room data!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new RoomController()