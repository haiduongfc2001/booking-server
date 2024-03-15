import { Room } from "../model/Room";

interface IRoomRepo {
    retrieveAll(): Promise<any[]>;
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
}
