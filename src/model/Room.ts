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
import { ROOM_STATUS } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";
import { RoomBooking } from "./RoomBooking";
import { RoomType } from "./RoomType";

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

  @ForeignKey(() => RoomType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_type_id!: number;

  @BelongsTo(() => RoomType)
  roomType!: RoomType;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  number!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Default(ROOM_STATUS.AVAILABLE)
  @Column({
    type: DataType.ENUM(ROOM_STATUS.AVAILABLE, ROOM_STATUS.UNAVAILABLE),
    allowNull: false,
  })
  status!: ROOM_STATUS;

  @HasMany(() => RoomBooking)
  roomBookings!: RoomBooking[];
}
