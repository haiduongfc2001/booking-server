import {
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import {
  BOOKING_GUEST_PAYMENT_STATUS,
  BOOKING_GUEST_STATUS,
} from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";
import { RoomBookingGuest } from "./RoomBookingGuest";

@Table({
  tableName: TABLE_NAME.BOOKING_GUEST,
})
export class BookingGuest extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  customer_name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  customer_phone!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  check_in!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  check_out!: Date;

  @Column({
    type: DataType.STRING,
    // allowNull: false,
  })
  note!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  total_room_price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  tax_and_fee!: number;

  @Default(BOOKING_GUEST_STATUS.CONFIRMED)
  @Column({
    type: DataType.ENUM(
      BOOKING_GUEST_STATUS.CONFIRMED,
      BOOKING_GUEST_STATUS.CHECKED_IN,
      BOOKING_GUEST_STATUS.CHECKED_OUT,
      BOOKING_GUEST_STATUS.CANCELLED
    ),
    allowNull: false,
  })
  status!: BOOKING_GUEST_STATUS;

  @Default(BOOKING_GUEST_PAYMENT_STATUS.UNPAID)
  @Column({
    type: DataType.ENUM(
      BOOKING_GUEST_PAYMENT_STATUS.PAID,
      BOOKING_GUEST_PAYMENT_STATUS.UNPAID
    ),
    allowNull: false,
  })
  payment_status!: BOOKING_GUEST_PAYMENT_STATUS;

  @HasMany(() => RoomBookingGuest)
  roomBookings!: RoomBookingGuest[];
}
