import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { RoomType } from "./RoomType";

@Table({
  tableName: TABLE_NAME.ROOM_TYPE_AMENITY,
})
export class RoomTypeAmenity extends Model {
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
  room_type!: RoomType;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  amenity!: string;
}
