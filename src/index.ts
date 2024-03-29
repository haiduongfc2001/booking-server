import express, { Application, Request, Response } from "express";
import cors from 'cors';
import { db } from "./config/database";
import ServiceRouter from "./router/ServiceRouter";
import CustomerRouter from "./router/CustomerRouter";
import HotelRouter from "./router/HotelRouter";
import HotelImageRouter from "./router/HotelImageRouter";
import StaffRouter from "./router/StaffRouter";
import RoomRouter from "./router/RoomRouter";
import * as dotenv from "dotenv";
import RoomImageRouter from "./router/RoomImageRouter";
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
    this.app.use(cors({
      origin: (process.env.ALLOWED_ORIGINS || "").split(","),
    }));
  }

  private setupRoutes(): void {
    const apiRouter = express.Router();

    apiRouter.get("/", (req: Request, res: Response) => {
      res.send("Welcome home");
    });

    apiRouter.use("/service", ServiceRouter);
    apiRouter.use("/customer", CustomerRouter);
    apiRouter.use("/hotel", HotelRouter);
    apiRouter.use("/hotel", HotelImageRouter);
    apiRouter.use("/hotel", RoomRouter);
    apiRouter.use("/hotel", StaffRouter);
    apiRouter.use("/hotel", RoomImageRouter);

    this.app.use("/api/v1", apiRouter);
  }

  private async startServer(): Promise<void> {
    const port = Number(process.env.PORT) || 5000;
    await db.sequelize?.sync();
    this.app.listen(port, () => {
      console.log(`✅ Server started successfully on port ${port}!`);
    });
  }
}

new App();
