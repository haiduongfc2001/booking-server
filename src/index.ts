import express, { Application, Request, Response } from "express";
import cors from 'cors';
import Database from "./config/database";
import ServiceRouter from "./router/ServiceRouter";
import CustomerRouter from "./router/CustomerRouter";
import HotelRouter from "./router/HotelRouter";
import HotelImageRouter from "./router/HotelImageRouter";
import * as dotenv from "dotenv";
import StaffRouter from "./router/StaffRouter";
import RoomRouter from "./router/RoomRouter";
dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.databaseSync();
    this.plugins();
    this.routes();
  }

  protected plugins(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({
      origin: (process.env.ALLOWED_ORIGINS || "").split(","),
    }));
  }

  protected databaseSync(): void {
    const db = new Database();
    db.sequelize?.sync();
  }

  protected routes(): void {
    this.app.route("/").get((req: Request, res: Response) => {
      res.send("welcome home");
    });
    this.app.use("/api/v1/service", ServiceRouter);
    this.app.use("/api/v1/customer", CustomerRouter);
    this.app.use("/api/v1/hotel", HotelRouter);
    this.app.use("/api/v1/hotel-image", HotelImageRouter);
    this.app.use("/api/v1/staff", StaffRouter);
    this.app.use("/api/v1/room", RoomRouter);
  }
}

const port: number = 5000;
const app = new App().app;

app.listen(port, () => {
  console.log(`✅ Server started successfully on port ${port}!`);
});


