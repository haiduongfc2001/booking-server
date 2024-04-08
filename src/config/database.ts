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
    this.POSTGRES_DB = process.env.POSTGRES_DB || "";
    this.POSTGRES_HOST = process.env.POSTGRES_HOST || "";
    this.POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;
    this.POSTGRES_USER = process.env.POSTGRES_USER || "";
    this.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "";

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
        updatedAt: "updated_at"
      }
    };

    this.sequelize = new Sequelize({
      database: this.POSTGRES_DB,
      username: this.POSTGRES_USER,
      password: this.POSTGRES_PASSWORD,
      host: this.POSTGRES_HOST,
      port: this.POSTGRES_PORT,
      dialect: "postgres",
      models: [Service, Customer, Hotel, HotelImage, Staff, Room, RoomImage, Province, District],
      define: config.define,
      logging: false,
    });

    try {
      await this.sequelize.authenticate();
      console.log("✅ PostgreSQL Connection has been established successfully.");
    } catch (error) {
      console.error("❌ Unable to connect to the PostgreSQL database:", error);
    }
  }
}

const db = Database.getInstance();
export { db };
