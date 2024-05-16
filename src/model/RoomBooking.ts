import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Room } from "./Room";
import { Booking } from "./Booking";

@Table({
  tableName: RoomBooking.TABLE_NAME,
})
export class RoomBooking extends Model {
  public static TABLE_NAME = "room_booking" as string;
  public static ROOM_BOOKING_ID = "id" as string;
  public static ROOM_ID = "room_id" as string;
  public static BOOKING_ID = "booking_id" as string;
  public static ROOM_BOOKING_NUM_ADULTS = "num_adults" as string;
  public static ROOM_BOOKING_NUM_CHILDREN = "num_children" as string;
  public static ROOM_BOOKING_CHILDREN_AGES = "children_ages" as string;
  public static ROOM_BOOKING_BASE_PRICE = "base_price" as string;
  public static ROOM_BOOKING_SURCHARGE = "surcharge" as string;
  public static ROOM_BOOKING_DISCOUNT = "discount" as string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: RoomBooking.ROOM_BOOKING_ID,
  })
  id!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomBooking.ROOM_ID,
  })
  room_id!: number;

  @BelongsTo(() => Room)
  room!: Room;

  @ForeignKey(() => Booking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomBooking.BOOKING_ID,
  })
  booking_id!: number;

  @BelongsTo(() => Booking)
  booking!: Booking;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomBooking.ROOM_BOOKING_NUM_ADULTS,
  })
  num_adults!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomBooking.ROOM_BOOKING_NUM_CHILDREN,
  })
  num_children!: number;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: false,
    field: RoomBooking.ROOM_BOOKING_CHILDREN_AGES,
  })
  children_ages!: number[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomBooking.ROOM_BOOKING_BASE_PRICE,
  })
  base_price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomBooking.ROOM_BOOKING_SURCHARGE,
  })
  surcharge!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomBooking.ROOM_BOOKING_DISCOUNT,
  })
  discount!: number;
}
