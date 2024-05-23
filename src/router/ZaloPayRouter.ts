import { Router } from "express";
import PaymentController from "../controller/PaymentController";
import { authFullRole } from "../middleware/Auth.middleware";

class ZaloPayRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/createPaymentUrl",
      authFullRole,
      PaymentController.createZaloPayPaymentUrl
    );
    this.router.post(
      "/callback",
      authFullRole,
      PaymentController.zaloPayCallback
    );
    this.router.get(
      "/orderStatus/:app_trans_id",
      authFullRole,
      PaymentController.zaloPayOrderStatus
    );
    this.router.post(
      "/getBankList",
      authFullRole,
      PaymentController.getBankListZaloPay
    );
  }
}

export default new ZaloPayRouter().router;
