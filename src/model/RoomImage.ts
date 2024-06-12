import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from "sequelize-typescript";
import { RoomType } from "./RoomType";
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

  @ForeignKey(() => RoomType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_type_id!: number;

  @BelongsTo(() => RoomType)
  roomType!: RoomType;

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
