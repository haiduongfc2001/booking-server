import express, { Application, Request, Response } from "express";
import cors from 'cors';
import Database from "./config/database";
import NoteRouter from "./router/NoteRouter";
import ServiceRouter from "./router/ServiceRouter";
import CustomerRouter from "./router/CustomerRouter";
import HotelRouter from "./router/HotelRouter";
import * as Minio from 'minio';

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
    this.app.use("/api/v1/note", NoteRouter);
    this.app.use("/api/v1/service", ServiceRouter);
    this.app.use("/api/v1/customer", CustomerRouter);
    this.app.use("/api/v1/hotel", HotelRouter);
  }
}

const port: number = 5000;
const app = new App().app;

app.listen(port, () => {
  console.log(`✅ Server started successfully on port ${port}!`);
});


