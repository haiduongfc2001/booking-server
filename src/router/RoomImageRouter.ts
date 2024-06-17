import BaseRoutes from "./base/BaseRouter";
import RoomImageController from "../controller/RoomImageController";
import multer from "multer";
import { authFullRole } from "../middleware/Auth.middleware";

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class HotelRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/:hotel_id/room/:room_type_id/getImagesByRoomId",
      authFullRole,
      RoomImageController.getImagesByRoomId
    );
    this.router.post(
      "/:hotel_id/room/:room_type_id/createRoomTypeImage",
      authFullRole,
      upload.single("image"),
      RoomImageController.createRoomTypeImage
    );
    this.router.post(
      "/:hotel_id/room/:room_type_id/createRoomTypeImages",
      authFullRole,
      upload.array("images", 5),
      RoomImageController.createRoomTypeImages
    );
    this.router.patch(
      "/room/:room_type_id/image/:room_image_id/updateRoomImageById",
      authFullRole,
      RoomImageController.updateRoomImageById
    );
    this.router.patch(
      "/room/:room_type_id/updateImagesByRoomId",
      authFullRole,
      upload.array("image"),
      RoomImageController.updateImagesByRoomId
    );
    this.router.delete(
      "/room/:room_type_id/image/:room_image_id/deleteImage",
      authFullRole,
      RoomImageController.deleteRoomImageById
    );
  }
}

export default new HotelRoutes().router;
