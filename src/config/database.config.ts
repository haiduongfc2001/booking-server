import { Sequelize } from "sequelize-typescript";
import * as dotenv from "dotenv";
import { Service } from "../model/Service";
import { Customer } from "../model/Customer";
import { Hotel } from "../model/Hotel";
import { HotelImage } from "../model/HotelImage";
import { Staff } from "../model/Staff";
import { Room } from "../model/Room";
import { RoomImage } from "../model/RoomImage";
import { Province } from "../model/Province";
import { District } from "../model/District";
import { Ward } from "../model/Ward";
import { Promotion } from "../model/Promotion";
import { Booking } from "../model/Booking";
import { RoomBooking } from "../model/RoomBooking";
import { Bed } from "../model/Bed";
import { RoomType } from "../model/RoomType";
import { Policy } from "../model/Policy";
import { Payment } from "../model/Payment";
import { PaymentMethod } from "../model/PaymentMethod";
import { Refund } from "../model/Refund";
import { Review } from "../model/Review";

dotenv.config();

class Database {
  private static instance: Database;
  public sequelize: Sequelize | undefined;

  private readonly POSTGRES_DB: string;
  private readonly POSTGRES_HOST: string;
  private readonly POSTGRES_PORT: number;
  private readonly POSTGRES_USER: string;
  private readonly POSTGRES_PASSWORD: string;

  private constructor() {
    this.POSTGRES_DB = process.env.POSTGRES_DB as string;
    this.POSTGRES_HOST = process.env.POSTGRES_HOST as string;
    this.POSTGRES_PORT = Number(process.env.POSTGRES_PORT) as number;
    this.POSTGRES_USER = process.env.POSTGRES_USER as string;
    this.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD as string;

    this.connectToPostgreSQL();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async connectToPostgreSQL() {
    const config = {
      define: {
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    };

    this.sequelize = new Sequelize({
      database: this.POSTGRES_DB,
      username: this.POSTGRES_USER,
      password: this.POSTGRES_PASSWORD,
      host: this.POSTGRES_HOST,
      port: this.POSTGRES_PORT,
      dialect: "postgres",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      models: [
        Service,
        Customer,
        Hotel,
        HotelImage,
        Staff,
        Room,
        RoomImage,
        Promotion,
        Province,
        District,
        Ward,
        Booking,
        RoomBooking,
        Bed,
        RoomType,
        Policy,
        Payment,
        PaymentMethod,
        Refund,
        Review,
      ],
      define: config.define,
      logging: false,
    });

    try {
      await this.sequelize
        .authenticate()
        .then(() => {
          console.log(
            "✅ PostgreSQL Connection has been established successfully."
          );
        })
        .catch((err: Error) => {
          console.error("❌ Unable to connect to the database:", err);
        });
    } catch (error) {
      console.error("❌ Unable to connect to the PostgreSQL database:", error);
    }
  }
}

const dbConfig = Database.getInstance();
export { dbConfig };
