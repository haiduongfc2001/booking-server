import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Booking } from "./Booking";
import { PaymentMethod } from "./PaymentMethod";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.PAYMENT,
})
export class Payment extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Booking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  booking_id!: number;

  @BelongsTo(() => Booking)
  booking!: Booking;

  @ForeignKey(() => PaymentMethod)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  payment_method_id!: number;

  @BelongsTo(() => PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  payment_date!: Date;
}
