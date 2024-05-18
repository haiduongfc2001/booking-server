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
import { Hotel } from "./Hotel";
import { Bed } from "./Bed";
import { ROOM_STATUS } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.ROOM,
})
export class Room extends Model {
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
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  number!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  adult_occupancy!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  child_occupancy!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  views!: string[];

  @Column({
    type: DataType.INTEGER,
  })
  area!: number;

  @Default(ROOM_STATUS.AVAILABLE)
  @Column({
    type: DataType.ENUM(...Object.values(ROOM_STATUS)),
    allowNull: false,
  })
  status!: ROOM_STATUS;

  @HasMany(() => Bed)
  beds!: Bed[];
}
