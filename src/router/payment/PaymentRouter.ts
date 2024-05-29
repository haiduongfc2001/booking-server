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
  }

  private initializeRoutes() {
    this.router.use("/vnpay", VNPayRouter);
    this.router.use("/zalopay", ZaloPayRouter);
  }

  public routes(): void {
    this.router.post(
      "/createPayment",
      authFullRole,
      PaymentController.createPayment
    );
    this.router.get("/getPayments", PaymentController.getPayments);
    this.router.get("/getPaymentById/:id", PaymentController.getPaymentById);
    this.router.put("/updatePayment/:id", PaymentController.updatePayment);
    this.router.delete("/deletePayment/:id", PaymentController.deletePayment);
  }
}

export default new PaymentRoutes().router;
