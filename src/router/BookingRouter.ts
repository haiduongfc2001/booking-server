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
  }
}

export default new BookingRoutes().router;
