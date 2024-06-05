import BaseRoutes from "./base/BaseRouter";
import RoomController from "../controller/RoomController";
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
      "/room/getAllRooms",
      authFullRole,
      updateRoomStatus,
      RoomController.getAllRooms
    );
    this.router.get(
      "/:hotel_id/room_type/:room_type_id/:room_id/getRoomById",
      authFullRole,
      updateRoomStatus,
      RoomController.getRoomById
    );
    this.router.post(
      "/:hotel_id/room_type/:room_type_id/createRoom",
      authFullRole,
      // validate(createRoomSchema),
      upload.array("images", 5),
      RoomController.createRoom
    );
    this.router.patch(
      "/:hotel_id/room_type/:room_type_id/updateRoom",
      authFullRole,
      updateRoomStatus,
      // validate(updateRoomSchema),
      upload.array("images", 5),
      RoomController.updateRoom
    );
    this.router.delete(
      "/:hotel_id/room_type/:room_type_id/:room_id/deleteRoom",
      authFullRole,
      RoomController.deleteRoom
    );
  }
}

export default new RoomRoutes().router;
