import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Hotel } from "./Hotel";

@Table({
  tableName: TABLE_NAME.HOTEL_AMENITY,
})
export class HotelAmenity extends Model {
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

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  amenity!: string;
}
