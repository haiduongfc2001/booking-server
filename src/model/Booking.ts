import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Customer } from "./Customer";

@Table({
  tableName: Booking.TABLE_NAME,
})
export class Booking extends Model {
  public static TABLE_NAME = "booking" as string;
  public static BOOKING_ID = "id" as string;
  public static CUSTOMER_ID = "customer_id" as string;
  public static BOOKING_CHECK_IN = "check_in" as string;
  public static BOOKING_CHECK_OUT = "check_out" as string;
  public static BOOKING_TOTAL_ROOM_PRICE = "total_room_price" as string;
  public static BOOKING_TAX_AND_FEE = "tax_and_fee" as string;
  public static BOOKING_STATUS = "status" as const;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: Booking.BOOKING_ID,
  })
  id!: number;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Booking.CUSTOMER_ID,
  })
  customer_id!: number;

  @BelongsTo(() => Customer)
  customer!: Customer;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: Booking.BOOKING_CHECK_IN,
  })
  check_in!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: Booking.BOOKING_CHECK_OUT,
  })
  check_out!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: Booking.BOOKING_TOTAL_ROOM_PRICE,
  })
  total_room_price!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: Booking.BOOKING_TAX_AND_FEE,
  })
  tax_and_fee!: number;

  @Default("pending")
  @Column({
    type: DataType.ENUM(
      "pending",
      "confirmed",
      "checked_in",
      "checked_out",
      "canceled"
    ),
    allowNull: false,
    field: Booking.BOOKING_STATUS,
  })
  status!: string;
}
