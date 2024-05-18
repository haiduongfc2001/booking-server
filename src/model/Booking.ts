import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Customer } from "./Customer";
import { BOOKING_STATUS } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";
import { RoomBooking } from "./RoomBooking";

@Table({
  tableName: TABLE_NAME.BOOKING,
})
export class Booking extends Model {
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

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  customer_id!: number;

  @BelongsTo(() => Customer)
  customer!: Customer;

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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  total_room_price!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  tax_and_fee!: number;

  @Default(BOOKING_STATUS.PENDING)
  @Column({
    type: DataType.ENUM(
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.CHECKED_IN,
      BOOKING_STATUS.CHECKED_OUT,
      BOOKING_STATUS.CANCELED
    ),
    allowNull: false,
  })
  status!: BOOKING_STATUS;

  @HasMany(() => RoomBooking)
  roomBookings!: RoomBooking[];
}
