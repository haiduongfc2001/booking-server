import { Router } from "express";
import { authFullRole } from "../../middleware/Auth.middleware";
import PaymentController from "../../controller/PaymentController";

class VNPayRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/createPaymentUrl",
      authFullRole,
      PaymentController.createVNPayPaymentUrl
    );
    this.router.post("/vnpayIPN", authFullRole, PaymentController.vnpayIPN);
    this.router.post("/returnUrl", authFullRole, PaymentController.returnUrl);
    this.router.post(
      "/getBankList",
      authFullRole,
      PaymentController.getBankListVNPay
    );
  }
}

export default new VNPayRouter().router;
