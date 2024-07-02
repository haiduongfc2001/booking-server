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
      "/calculateMinCost",
      authFullRole,
      BookingController.calculateMinCost
    );
    this.router.post(
      "/createBooking",
      authFullRole,
      BookingController.createBooking
    );
    this.router.post(
      "/getAllBookingsByCustomerId/:customer_id",
      authFullRole,
      BookingController.getAllBookingsByCustomerId
    );
    this.router.get(
      "/:hotel_id/getAllBookingsByHotelId",
      authFullRole,
      BookingController.getAllBookingsByHotelId
    );
    this.router.get(
      "/getBookingStats",
      authFullRole,
      BookingController.getBookingStats
    );
    this.router.get(
      "/getTotalBookingRevenue",
      authFullRole,
      BookingController.getTotalBookingRevenue
    );
    this.router.get(
      "/getTotalBookingRevenueByHotelId/:hotel_id",
      authFullRole,
      BookingController.getTotalBookingRevenueByHotelId
    );
    this.router.get(
      "/getMonthlyBookingRevenue",
      authFullRole,
      BookingController.getMonthlyBookingRevenue
    );
    this.router.get(
      "/getMonthlyBookingRevenueByHotelId/:hotel_id",
      authFullRole,
      BookingController.getMonthlyBookingRevenueByHotelId
    );
    this.router.post(
      "/:booking_id/updateBooking",
      authFullRole,
      BookingController.updateBooking
    );
  }
}

export default new BookingRoutes().router;
