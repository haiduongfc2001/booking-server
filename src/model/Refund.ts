import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Payment } from "./Payment";
import { REFUND_STATUS } from "../config/enum.config";

@Table({
  tableName: TABLE_NAME.REFUND,
})
export class Refund extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Payment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  payment_id!: number;

  @BelongsTo(() => Payment)
  payment!: Payment;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
    // allowNull: false,
  })
  reason!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  refund_date!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refund_trans_reference!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  provider_metadata!: string;

  @Default(REFUND_STATUS.PENDING)
  @Column({
    type: DataType.ENUM(
      REFUND_STATUS.PENDING,
      REFUND_STATUS.FAILED,
      REFUND_STATUS.COMPLETED
    ),
    allowNull: false,
  })
  status!: REFUND_STATUS;
}
