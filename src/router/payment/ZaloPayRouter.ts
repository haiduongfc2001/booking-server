import { Router } from "express";
import { authFullRole } from "../../middleware/Auth.middleware";
import PaymentController from "../../controller/PaymentController";

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
    this.router.post(
      "/zaloPayRefund",
      authFullRole,
      PaymentController.zaloPayRefund
    );
    this.router.get(
      "/zaloPayRefundStatus/:m_refund_id",
      authFullRole,
      PaymentController.zaloPayRefundStatus
    );
  }
}

export default new ZaloPayRouter().router;
