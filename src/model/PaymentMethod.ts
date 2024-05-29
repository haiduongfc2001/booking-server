import { Column, DataType, Model, Table, HasMany } from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Payment } from "./Payment";

@Table({
  tableName: TABLE_NAME.PAYMENT_METHOD,
})
export class PaymentMethod extends Model {
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
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description!: string;

  @HasMany(() => Payment)
  payments!: Payment[];
}
