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
import { Bed } from "./Bed";
import { ROOM_STATUS } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";
import { RoomBooking } from "./RoomBooking";
import { RoomType } from "./RoomType";
import { RoomImage } from "./RoomImage";

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
    type: DataType.INTEGER,
    allowNull: false,
  })
  max_occupancy!: number;

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
    type: DataType.ENUM(ROOM_STATUS.AVAILABLE, ROOM_STATUS.UNAVAILABLE),
    allowNull: false,
  })
  status!: ROOM_STATUS;

  @HasMany(() => Bed)
  beds!: Bed[];

  @HasMany(() => RoomBooking)
  roomBookings!: RoomBooking[];

  @HasMany(() => RoomImage)
  roomImages!: RoomImage[];
}
