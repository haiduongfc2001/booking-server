import { Sequelize } from "sequelize-typescript";
import * as dotenv from "dotenv";
import { Service } from "../model/Service";
import { Customer } from "../model/Customer";
import { Hotel } from "../model/Hotel";
import { HotelImage } from "../model/HotelImage";
import { Staff } from "../model/Staff";
import { Room } from "../model/Room";
import { RoomImage } from "../model/RoomImage";
dotenv.config();


class Database {
  public sequelize: Sequelize | undefined;


  private POSTGRES_DB = process.env.POSTGRES_DB as string;
  private POSTGRES_HOST = process.env.POSTGRES_HOST as string;
  private POSTGRES_PORT = process.env.POSTGRES_PORT as unknown as number;
  private POSTGRES_USER = process.env.POSTGRES_USER as unknown as string;
  private POSTGRES_PASSWORD = process.env
    .POSTGRES_PASSWORD as unknown as string;

  constructor() {
    this.connectToPostgreSQL();
  }

  private async connectToPostgreSQL() {
    var config = {
      "define": {
        "createdAt": "created_at",
        "updatedAt": "updated_at"
      }
    };

    this.sequelize = new Sequelize({
      database: this.POSTGRES_DB,
      username: this.POSTGRES_USER,
      password: this.POSTGRES_PASSWORD,
      host: this.POSTGRES_HOST,
      port: this.POSTGRES_PORT,
      dialect: "postgres",
      models: [Service, Customer, Hotel, HotelImage, Staff, Room, RoomImage],
      define: config.define,
      logging: false,
    });

    await this.sequelize
      .authenticate()
      .then(() => {
        console.log(
          "✅ PostgreSQL Connection has been established successfully."
        );
      })
      .catch((err) => {
        console.error("❌ Unable to connect to the PostgreSQL database:", err);
      });
  }
}

export default Database;