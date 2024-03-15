import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Room } from "./Room";

@Table({
    tableName: RoomImage.ROOM_IMAGE_TABLE_NAME,
})
export class RoomImage extends Model {
    public static ROOM_IMAGE_TABLE_NAME = "room_image" as string;
    public static ROOM_IMAGE_ID = "id" as string;
    public static ROOM_IMAGE_ROOM_ID = "room_id" as string;
    public static ROOM_IMAGE_URL = "url" as string;

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
        field: RoomImage.ROOM_IMAGE_ROOM_ID,
    })
    room_id!: number;

    @BelongsTo(() => Room, 'room_id')
    room!: Room;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: RoomImage.ROOM_IMAGE_URL,
    })
    url!: string;
}
