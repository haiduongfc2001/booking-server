import BaseRoutes from "./base/BaseRouter";
import { authFullRole } from "../middleware/Auth.middleware";
import PaymentController from "../controller/PaymentController";

class PaymentRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/createPaymentUrl",
      authFullRole,
      PaymentController.createPaymentUrl
    );
  }
}

export default new PaymentRoutes().router;
