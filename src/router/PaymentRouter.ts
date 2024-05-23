import BaseRoutes from "./base/BaseRouter";
import { authFullRole } from "../middleware/Auth.middleware";
import PaymentController from "../controller/PaymentController";

class PaymentRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/vnpay/createPaymentUrl",
      authFullRole,
      PaymentController.createVNPayPaymentUrl
    );
    this.router.post(
      "/zalopay/createPaymentUrl",
      authFullRole,
      PaymentController.createZaloPayPaymentUrl
    );
    this.router.post(
      "/zalopay/callback",
      authFullRole,
      PaymentController.zaloPayCallback
    );
    this.router.get(
      "/zalopay/orderStatus/:app_trans_id",
      authFullRole,
      PaymentController.zaloPayOrderStatus
    );
  }
}

export default new PaymentRoutes().router;
