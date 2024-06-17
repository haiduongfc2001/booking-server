import BaseRoutes from "./base/BaseRouter";
import RoomTypeController from "../controller/RoomTypeController";
import multer from "multer";
import validate from "../helper/validate";
import { createRoomSchema, updateRoomSchema } from "../schema/RoomSchema";
import { authFullRole } from "../middleware/Auth.middleware";
import { updateRoomStatus } from "../middleware/UpdateStatus.middleware";

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class RoomRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/:room_type_id/getAllRoomTypes",
      // authFullRole,
      updateRoomStatus,
      RoomTypeController.getAllRoomTypes
    );
    this.router.get(
      "/:hotel_id/room-type/:room_type_id/getRoomTypeById",
      // authFullRole,
      updateRoomStatus,
      RoomTypeController.getRoomTypeById
    );
    this.router.post(
      "/:hotel_id/room-type/createRoomType",
      // authFullRole,
      // validate(createRoomSchema),
      upload.array("images", 5),
      RoomTypeController.createRoomType
    );
    this.router.patch(
      "/:hotel_id/room-type/:room_type_id/updateRoomType",
      // authFullRole,
      RoomTypeController.updateRoomType
    );
    this.router.delete(
      "/:hotel_id/room-type/:room_type_id/deleteRoomType",
      // authFullRole,
      RoomTypeController.deleteRoomType
    );
  }
}

export default new RoomRoutes().router;
