import BaseRoutes from "./base/BaseRouter";
import RoomController from "../controller/RoomController";
import multer from 'multer';
import validate from "../helper/validate";
import { createRoomSchema, updateRoomSchema } from "../schema/RoomSchema";

// Set up multer storage
const storage = multer.memoryStorage();

class RoomRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/room/getAllRooms", RoomController.getAllRooms);
        this.router.get("/:hotel_id/room/getAllRoomsByHotelId", RoomController.getAllRoomsByHotelId);
        this.router.get("/:hotel_id/room/:room_id/getRoomById", RoomController.getRoomById);
        this.router.post("/:hotel_id/createRoom",
            validate(createRoomSchema), RoomController.createRoom);
        this.router.patch(
            "/:hotel_id/room/:room_id/updateRoom",
            validate(updateRoomSchema),
            RoomController.updateRoom
        );
        this.router.delete("/:hotel_id/room/:room_id/deleteRoom", RoomController.deleteRoom);
    }
}

export default new RoomRoutes().router;