import BaseRoutes from "./base/BaseRouter";
import BookingController from "../controller/BookingController";
import { authFullRole } from "../middleware/Auth.middleware";

class BookingRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllBookings",
      authFullRole,
      BookingController.getAllBookings
    );
    this.router.get(
      "/:booking_id/getBookingById",
      authFullRole,
      BookingController.getBookingById
    );
    this.router.post(
      "/createBooking",
      authFullRole,
      BookingController.createBooking
    );
    this.router.post(
      "/calculateMinCost",
      authFullRole,
      BookingController.calculateMinCost
    );
  }
}

export default new BookingRoutes().router;
