import BaseRoutes from "./base/BaseRouter";
import RoomImageController from "../controller/RoomImageController";
import multer from "multer";
import { authFullRole } from "../middleware/AuthCustomer";

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class HotelRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/:hotel_id/room/:room_id/getImagesByRoomId",
      authFullRole,
      RoomImageController.getImagesByRoomId
    );
    this.router.post(
      "/:hotel_id/room/:room_id/createRoomImage",
      authFullRole,
      upload.single("image"),
      RoomImageController.createRoomImage
    );
    this.router.post(
      "/:hotel_id/room/:room_id/createRoomImages",
      authFullRole,
      upload.array("images", 5),
      RoomImageController.createRoomImages
    );
    this.router.patch(
      "/:hotel_id/room/:room_id/image/:room_image_id/updateRoomImageById",
      authFullRole,
      RoomImageController.updateRoomImageById
    );
    this.router.patch(
      "/:hotel_id/room/:room_id/updateImagesByRoomId",
      authFullRole,
      upload.array("image"),
      RoomImageController.updateImagesByRoomId
    );
    this.router.delete(
      "/:hotel_id/room/:room_id/image/:room_image_id/deleteImage",
      authFullRole,
      RoomImageController.deleteRoomImageById
    );
  }
}

export default new HotelRoutes().router;
