import express, { Application, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import "./middleware/CronJobs";
import { dbConfig } from "./config/database.config";
import CustomerRouter from "./router/CustomerRouter";
import HotelRouter from "./router/HotelRouter";
import HotelImageRouter from "./router/HotelImageRouter";
import StaffRouter from "./router/StaffRouter";
import RoomRouter from "./router/RoomRouter";
import RoomImageRouter from "./router/RoomImageRouter";
import AddressRouter from "./router/AddressRouter";
import BookingRouter from "./router/BookingRouter";
import PaymentRouter from "./router/payment/PaymentRouter";
import PromotionRouter from "./router/PromotionRouter";
import ReviewRouter from "./router/ReviewRouter";
import AdminRouter from "./router/AdminRouter";
import RoomTypeRouter from "./router/RoomTypeRouter";
import BedRouter from "./router/BedRouter";
import RoomTypeAmenityRouter from "./router/RoomTypeAmenityRouter";
import HotelAmenityRouter from "./router/HotelAmenityRouter";
import PolicyRouter from "./router/PolicyRouter";
import PaymentMethodRouter from "./router/payment/PaymentMethodRouter";

dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureApp();
    this.startServer();
  }

  private configureApp(): void {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // this.app.use(
    //   cors({
    //     origin: (process.env.ALLOWED_ORIGINS || "").split(","),
    //   })
    // );
    this.app.use(cors());
  }

  private setupRoutes(): void {
    const apiRouter = express.Router();

    apiRouter.get("/", (req: Request, res: Response) => {
      res.send("Welcome home");
    });

    apiRouter.use("/customer", CustomerRouter);
    apiRouter.use("/hotel", HotelRouter);
    apiRouter.use("/hotel", HotelImageRouter);
    apiRouter.use("/hotel", HotelAmenityRouter);
    apiRouter.use("/hotel", PolicyRouter);
    apiRouter.use("/hotel", RoomRouter);
    apiRouter.use("/hotel", StaffRouter);
    apiRouter.use("/hotel", RoomImageRouter);
    apiRouter.use("/address", AddressRouter);
    apiRouter.use("/booking", BookingRouter);
    apiRouter.use("/payment", PaymentRouter);
    apiRouter.use("/hotel/room-type", PromotionRouter);
    apiRouter.use("/payment-method", PaymentMethodRouter);
    apiRouter.use("/review", ReviewRouter);
    apiRouter.use("/admin", AdminRouter);
    apiRouter.use("/hotel", RoomTypeRouter);
    apiRouter.use("/hotel/room-type", BedRouter);
    apiRouter.use("/hotel/room-type", RoomTypeAmenityRouter);

    this.app.use("/api/v1", apiRouter);
  }

  private async startServer(): Promise<void> {
    const port = Number(process.env.PORT) || 5000;
    await dbConfig.sequelize?.sync({
      // force: true,
      alter: true,
    });
    console.log("✅ All models were synchronized successfully.");

    this.app.listen(port, () => {
      console.log(`✅ Server started successfully on port ${port}!`);
    });
  }
}

new App();
