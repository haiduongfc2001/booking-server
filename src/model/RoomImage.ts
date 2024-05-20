import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from "sequelize-typescript";
import { Room } from "./Room";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.ROOM_IMAGE,
})
export class RoomImage extends Model {
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

  @BelongsTo(() => Room, "room_id")
  room!: Room;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  url!: string;

  @Default("")
  @Column({
    type: DataType.STRING,
  })
  caption?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_primary!: boolean;
}
