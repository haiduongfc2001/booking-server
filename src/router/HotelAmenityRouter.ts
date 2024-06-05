import BaseRoutes from "./base/BaseRouter";
import { authFullRole } from "../middleware/Auth.middleware";
import HotelAmenityController from "../controller/HotelAmenityController";

class HotelAmenityRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/createHotelAmenity",
      authFullRole,
      HotelAmenityController.createHotelAmenity
    );
    this.router.get(
      "/getHotelAmenities/:hotel_id",
      authFullRole,
      HotelAmenityController.getHotelAmenities
    );
    this.router.get(
      "/getHotelAmenityById/:id",
      authFullRole,
      HotelAmenityController.getHotelAmenityById
    );
    this.router.put(
      "/updateHotelAmenity/:id",
      authFullRole,
      HotelAmenityController.updateHotelAmenity
    );
    this.router.delete(
      "/deleteHotelAmenity/:id",
      authFullRole,
      HotelAmenityController.deleteHotelAmenity
    );
  }
}

export default new HotelAmenityRoutes().router;
