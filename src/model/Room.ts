import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Hotel } from "./Hotel";

@Table({
  tableName: "room",
})
export class Room extends Model {
  public static ROOM_ID = "id";
  public static ROOM_HOTEL_ID = "hotel_id";
  public static ROOM_NUMBER = "number";
  public static ROOM_TYPE = "type";
  public static ROOM_PRICE = "price";
  public static ROOM_DISCOUNT = "discount";
  public static ROOM_CAPACITY = "capacity";
  public static ROOM_DESCRIPTION = "description";
  public static ROOM_RATING_AVERAGE = "rating_average";
  public static ROOM_STATUS = "status" as const;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: Room.ROOM_ID,
  })
  id!: number;

  @ForeignKey(() => Hotel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "hotel_id",
  })
  hotel_id!: number;

  @BelongsTo(() => Hotel)
  hotel!: Hotel;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: Room.ROOM_NUMBER,
  })
  number!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: Room.ROOM_TYPE,
  })
  type!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Room.ROOM_PRICE,
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Room.ROOM_DISCOUNT,
  })
  discount!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Room.ROOM_CAPACITY,
  })
  capacity!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: Room.ROOM_DESCRIPTION,
  })
  description!: string;

  @Default(0.0)
  @Column({
    type: DataType.DECIMAL(2, 1),
    allowNull: false,
    validate: {
      min: 0.0,
      max: 5.0,
    },
    field: Room.ROOM_RATING_AVERAGE,
  })
  rating_average!: number;

  @Default("available")
  @Column({
    type: DataType.ENUM("available", "unavailable"),
    allowNull: false,
    field: Room.ROOM_STATUS,
  })
  status!: string;
}
