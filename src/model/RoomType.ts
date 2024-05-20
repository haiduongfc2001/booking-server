import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Room } from "./Room";

@Table({
  tableName: TABLE_NAME.ROOM_TYPE,
})
export class RoomType extends Model {
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
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @HasMany(() => Room)
  rooms!: Room[];
}
