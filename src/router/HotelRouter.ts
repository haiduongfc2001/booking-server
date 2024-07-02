import BaseRoutes from "./base/BaseRouter";
import HotelController from "../controller/HotelController";
import validate from "../helper/validate";
import { createHotelSchema, updateHotelSchema } from "../schema/HotelSchema";
import {
  authAdmin,
  authFullRole,
  authManagerOrAdmin,
  authReceptionistOrManagerOrAdmin,
} from "../middleware/Auth.middleware";
import { updateRoomStatus } from "../middleware/UpdateStatus.middleware";

class HotelRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllHotels",
      // authFullRole,
      HotelController.getAllHotels
    );
    this.router.get(
      "/getHotelList",
      // authFullRole,
      HotelController.getHotelList
    );
    this.router.get(
      "/:hotel_id/getHotelById",
      // authFullRole,
      HotelController.getHotelById
    );
    this.router.post(
      "/:hotel_id/getHotelDetail",
      // authFullRole,
      HotelController.getHotelDetail
    );
    this.router.get(
      "/:hotel_id/getStaffsByHotelId",
      authManagerOrAdmin,
      HotelController.getStaffsByHotelId
    );
    this.router.get(
      "/:hotel_id/getAllRoomTypesByHotelId",
      authReceptionistOrManagerOrAdmin,
      HotelController.getAllRoomTypesByHotelId
    );
    this.router.get(
      "/:hotel_id/getAllStaffsByHotelId",
      authManagerOrAdmin,
      HotelController.getAllStaffsByHotelId
    );
    this.router.get(
      "/getOutstandingHotels",
      // authFullRole,
      HotelController.getOutstandingHotels
    );
    this.router.post(
      "/getHotelSearchResults",
      // authFullRole,
      // updateRoomStatus,
      HotelController.getHotelSearchResults
    );
    this.router.post(
      "/createHotel",
      authAdmin,
      validate(createHotelSchema),
      HotelController.createHotel
    );
    this.router.patch(
      "/:hotel_id/updateHotel",
      authManagerOrAdmin,
      validate(updateHotelSchema),
      HotelController.updateHotel
    );
    this.router.delete(
      "/:hotel_id/deleteHotel",
      authAdmin,
      HotelController.deleteHotel
    );
    this.router.get(
      "/getTotalHotels",
      // authFullRole,
      HotelController.getTotalHotels
    );
    this.router.post(
      "/:hotel_id/getAllAvailableRoomTypesByHotelId",
      authReceptionistOrManagerOrAdmin,
      HotelController.getAllAvailableRoomTypesByHotelId
    );
  }
}

export default new HotelRoutes().router;
