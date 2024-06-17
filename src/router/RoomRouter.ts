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
      "/room-type/:room_type_id/room/:room_id/getRoomById",
      authFullRole,
      updateRoomStatus,
      RoomController.getRoomById
    );
    this.router.post(
      "/room-type/:room_type_id/room/createRoom",
      authFullRole,
      RoomController.createRoom
    );
    this.router.patch(
      "/room-type/:room_type_id/room/:room_id/updateRoom",
      authFullRole,
      updateRoomStatus,
      RoomController.updateRoom
    );
    this.router.delete(
      "/room-type/:room_type_id/room/:room_id/deleteRoom",
      authFullRole,
      RoomController.deleteRoom
    );
  }
}

export default new RoomRoutes().router;
