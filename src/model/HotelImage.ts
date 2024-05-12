import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Hotel } from "./Hotel";

@Table({
  tableName: HotelImage.TABLE_NAME,
})
export class HotelImage extends Model {
  public static TABLE_NAME = "hotel_image" as string;
  public static HOTEL_IMAGE_ID = "id" as string;
  public static HOTEL_ID = "hotel_id" as string;
  public static HOTEL_IMAGE_URL = "url" as string;
  public static HOTEL_IMAGE_CAPTION = "caption" as string;
  public static HOTEL_IMAGE_IS_PRIMARY = "is_primary" as string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: HotelImage.HOTEL_IMAGE_ID,
  })
  id!: number;

  @ForeignKey(() => Hotel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: HotelImage.HOTEL_ID,
  })
  hotel_id!: number;

  @BelongsTo(() => Hotel, "hotel_id")
  hotel!: Hotel;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: HotelImage.HOTEL_IMAGE_URL,
  })
  url!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: "",
    field: HotelImage.HOTEL_IMAGE_CAPTION,
  })
  caption?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: HotelImage.HOTEL_IMAGE_IS_PRIMARY,
  })
  is_primary!: boolean;
}
