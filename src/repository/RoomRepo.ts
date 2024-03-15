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
}
