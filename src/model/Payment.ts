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
import { Booking } from "./Booking";
import { PaymentMethod } from "./PaymentMethod";
import { TABLE_NAME } from "../config/constant.config";
import { Refund } from "./Refund";
import { PAYMENT_STATUS } from "../config/enum.config";

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
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  transaction_date!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  trans_reference!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  provider_metadata!: object;

  @Default(PAYMENT_STATUS.PENDING)
  @Column({
    type: DataType.ENUM(
      PAYMENT_STATUS.PENDING,
      PAYMENT_STATUS.COMPLETED,
      PAYMENT_STATUS.FAILED,
      PAYMENT_STATUS.CANCELLED,
      PAYMENT_STATUS.REFUNDED,
      PAYMENT_STATUS.EXPIRED
    ),
    allowNull: false,
  })
  status!: PAYMENT_STATUS;

  @HasMany(() => Refund)
  refunds!: Refund[];
}
