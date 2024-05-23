import { Router } from "express";
import VNPayRouter from "./VNPayRouter";
import ZaloPayRouter from "./ZaloPayRouter";

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
}

export default new PaymentRoutes().router;
