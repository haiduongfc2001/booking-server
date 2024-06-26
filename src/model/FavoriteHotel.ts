import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Hotel } from "./Hotel";
import { Customer } from "./Customer";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.FAVORITE_HOTEL,
})
export class FavoriteHotel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Hotel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  hotel_id!: number;

  @BelongsTo(() => Hotel)
  hotel!: Hotel;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  customer_id!: number;

  @BelongsTo(() => Customer)
  customer!: Customer;
}
