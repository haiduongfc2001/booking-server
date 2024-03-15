import { Room } from "../model/Room";

interface IRoomRepo {
    retrieveAll(): Promise<any[]>;
    save(room: Room): Promise<void>;
    delete(roomId: number): Promise<void>;
    retrieveById(roomId: number): Promise<Room>;
    retrieveRoomByHotelId(hotelId: number): Promise<Room[]>;
}

export class RoomRepo implements IRoomRepo {
    async retrieveAll(): Promise<any[]> {
        try {
            const rooms = await Room.findAll({
                order: [['id', 'asc']]
            });

            return rooms;
        } catch (error) {
            throw new Error("Failed to retrieve all rooms!");
        }
    }

    async save(newRoom: Room): Promise<void> {
        try {
            await Room.create({
                hotel_id: newRoom.hotel_id,
                number: newRoom.number,
                type: newRoom.type,
                price: newRoom.price,
                discount: newRoom.discount,
                capacity: newRoom.capacity,
                description: newRoom.description,
                status: newRoom.status,
            })
        } catch (error) {
            throw new Error("Failed to save room!");
        }
    }

    async delete(roomId: number): Promise<void> {
        try {
            const existingRoom = await Room.findOne({
                where: {
                    id: roomId,
                }
            })

            if (!existingRoom) {
                throw new Error("Room not found!");
            }

            await existingRoom.destroy();
        } catch (error) {

        }
    }

    async retrieveById(roomId: number): Promise<Room> {
        try {
            const existingRoom = await Room.findOne({
                where: {
                    id: roomId,
                }
            })

            if (!existingRoom) {
                throw new Error("Room not found!");
            }

            return existingRoom;
        } catch (error) {
            throw new Error("Failed to retrieve room by ID!");
        }
    }

    async retrieveRoomByHotelId(hotelId: number): Promise<Room[]> {
        try {
            const rooms = await Room.findAll({
                where: {
                    hotel_id: hotelId
                },
                order: [['id', 'asc']]
            })

            return rooms;
        } catch (error) {
            throw new Error("Failed to retrieve room by ID!");
        }
    }
}
