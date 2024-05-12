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
import { Customer } from "./Customer";

@Table({
  tableName: Booking.TABLE_NAME,
})
export class Booking extends Model {
  public static TABLE_NAME = "booking" as string;
  public static BOOKING_ID = "id" as string;
  public static CUSTOMER_ID = "customer_id" as string;
  public static ROOM_ID = "room_id" as string;
  public static BOOKING_CHECK_IN_DATE = "check_in_date" as string;
  public static BOOKING_CHECK_OUT_DATE = "check_out_date" as string;
  public static BOOKING_QUANTITY = "quantity" as string;
  public static BOOKING_TOTAL_AMOUNT = "total_amount" as string;
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

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Booking.ROOM_ID,
  })
  room_id!: number;

  @BelongsTo(() => Room)
  hotel!: Room;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: Booking.BOOKING_CHECK_IN_DATE,
  })
  check_in_date!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: Booking.BOOKING_CHECK_OUT_DATE,
  })
  check_out_date!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Booking.BOOKING_QUANTITY,
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: Booking.BOOKING_TOTAL_AMOUNT,
  })
  total_amount!: number;

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
