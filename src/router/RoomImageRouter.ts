import BaseRoutes from "./base/BaseRouter";
import RoomImageController from "../controller/RoomImageController";
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class HotelRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/:hotel_id/room/:room_id/getImagesByRoomId", RoomImageController.getImagesByRoomId);
        this.router.post(
            "/:hotel_id/room/:room_id/createRoomImages",
            upload.array('image'),
            RoomImageController.createRoomImages
        )
    }
}

export default new HotelRoutes().router;