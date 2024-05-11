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
  public static HOTEL_ID = "hotel_id";
  public static ROOM_NUMBER = "number";
  public static ROOM_TYPE = "type";
  public static ROOM_PRICE = "price";
  public static ROOM_ADULT_OCCUPANCY = "adult_occupancy";
  public static ROOM_CHILD_OCCUPANCY = "child_occupancy";
  public static ROOM_DESCRIPTION = "description";
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
    field: Room.HOTEL_ID,
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
    field: Room.ROOM_ADULT_OCCUPANCY,
  })
  adult_occupancy!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Room.ROOM_CHILD_OCCUPANCY,
  })
  child_occupancy!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: Room.ROOM_DESCRIPTION,
  })
  description!: string;

  @Default("available")
  @Column({
    type: DataType.ENUM("available", "unavailable"),
    allowNull: false,
    field: Room.ROOM_STATUS,
  })
  status!: string;
}
