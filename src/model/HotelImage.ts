import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Hotel } from "./Hotel";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.HOTEL_IMAGE,
})
export class HotelImage extends Model {
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

  @BelongsTo(() => Hotel, "hotel_id")
  hotel!: Hotel;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  url!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: "",
  })
  caption?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_primary!: boolean;
}
