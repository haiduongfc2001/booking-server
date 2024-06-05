import BaseRoutes from "./base/BaseRouter";
import RoomController from "../controller/RoomController";
import { authFullRole } from "../middleware/Auth.middleware";
import { updateRoomStatus } from "../middleware/UpdateStatus.middleware";

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
      RoomController.createRoom
    );
    this.router.patch(
      "/:hotel_id/room_type/:room_type_id/updateRoom",
      authFullRole,
      updateRoomStatus,
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
