import BaseRoutes from "./base/BaseRouter";
import RoomController from "../controller/RoomController";
import multer from 'multer';
import validate from "../helper/validate";
import { createRoomSchema, updateRoomSchema } from "../schema/RoomSchema";

// Set up multer storage
const storage = multer.memoryStorage();

class RoomRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/", RoomController.getAllRooms);
        this.router.get("/:id", RoomController.getRoomById);
        this.router.post("/",
            validate(createRoomSchema), RoomController.createRoom);
        this.router.patch(
            "/:id",
            validate(updateRoomSchema),
            RoomController.updateRoom
        );
        this.router.delete("/:id", RoomController.deleteRoom);
    }
}

export default new RoomRoutes().router