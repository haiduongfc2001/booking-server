import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Room } from "./Room";
import { BED_TYPE } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.BED,
})
export class Bed extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id!: number;

  @BelongsTo(() => Room)
  room!: Room;

  @Column({
    type: DataType.ENUM(...Object.values(BED_TYPE)),
    allowNull: false,
  })
  type!: BED_TYPE;

  @Column({
    type: DataType.STRING,
  })
  description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity!: number;
}
