import BaseRoutes from "./base/BaseRouter";
import RoomController from "../controller/RoomController";
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();

class RoomRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/", RoomController.getAllRooms);
        this.router.post("/", RoomController.createRoom);
    }
}

export default new RoomRoutes().router