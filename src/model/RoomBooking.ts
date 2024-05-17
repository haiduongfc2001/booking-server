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
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.ROOM_BOOKING,
})
export class RoomBooking extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id!: number;

  @BelongsTo(() => Room)
  room!: Room;

  @ForeignKey(() => Booking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  booking_id!: number;

  @BelongsTo(() => Booking)
  booking!: Booking;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  num_adults!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  num_children!: number;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: false,
  })
  children_ages!: number[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  base_price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  surcharge!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  discount!: number;
}
