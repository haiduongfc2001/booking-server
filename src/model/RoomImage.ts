import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Room } from "./Room";

@Table({
  tableName: RoomImage.TABLE_NAME,
})
export class RoomImage extends Model {
  public static TABLE_NAME = "room_image" as string;
  public static ROOM_IMAGE_ID = "id" as string;
  public static ROOM_ID = "room_id" as string;
  public static ROOM_IMAGE_URL = "url" as string;
  public static ROOM_IMAGE_CAPTION = "caption" as string;
  public static ROOM_IMAGE_IS_PRIMARY = "is_primary" as string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: RoomImage.ROOM_IMAGE_ID,
  })
  id!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RoomImage.ROOM_ID,
  })
  room_id!: number;

  @BelongsTo(() => Room, "room_id")
  room!: Room;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: RoomImage.ROOM_IMAGE_URL,
  })
  url!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: "",
    field: RoomImage.ROOM_IMAGE_CAPTION,
  })
  caption?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: RoomImage.ROOM_IMAGE_IS_PRIMARY,
  })
  is_primary!: boolean;
}
