import { Router } from "express";
import VNPayRouter from "./VNPayRouter";
import ZaloPayRouter from "./ZaloPayRouter";
import PaymentController from "../../controller/PaymentController";
import { authFullRole } from "../../middleware/Auth.middleware";

class PaymentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
    this.routes();
  }

  private initializeRoutes() {
    this.router.use("/vnpay", VNPayRouter);
    this.router.use("/zalopay", ZaloPayRouter);
  }

  private routes() {
    this.router.post(
      "/createPayment",
      authFullRole,
      PaymentController.createPayment
    );
    this.router.get("/getPayments", PaymentController.getPayments);
    this.router.get("/getPaymentById/:id", PaymentController.getPaymentById);
    this.router.put("/updatePayment/:id", PaymentController.updatePayment);
    this.router.delete("/deletePayment/:id", PaymentController.deletePayment);
    this.router.post(
      "/updatePaymentStatus",
      authFullRole,
      PaymentController.updatePaymentStatus
    );
  }
}

export default new PaymentRoutes().router;
