import BaseRoutes from "./base/BaseRouter";
import { authFullRole } from "../middleware/Auth.middleware";
import RoomTypeAmenityController from "../controller/RoomTypeAmenityController";

class RoomTypeAmenityRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/:room_type_id/amenity/createRoomTypeAmenity",
      authFullRole,
      RoomTypeAmenityController.createRoomTypeAmenity
    );
    this.router.get(
      "/getRoomTypeAmenities/:room_type_id",
      authFullRole,
      RoomTypeAmenityController.getRoomTypeAmenities
    );
    this.router.get(
      "/getRoomTypeAmenityById/:id",
      authFullRole,
      RoomTypeAmenityController.getRoomTypeAmenityById
    );
    this.router.put(
      "/updateRoomTypeAmenity/:id",
      authFullRole,
      RoomTypeAmenityController.updateRoomTypeAmenity
    );
    this.router.delete(
      "/:room_type_id/amenity/:amenity_id/deleteRoomTypeAmenity",
      authFullRole,
      RoomTypeAmenityController.deleteRoomTypeAmenity
    );
  }
}

export default new RoomTypeAmenityRoutes().router;
