import { Model, Table, Column, DataType, HasMany } from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Policy } from "./Policy";
import { RoomType } from "./RoomType";
import { HotelImage } from "./HotelImage";
import { HotelAmenity } from "./HotelAmenity";

@Table({
  tableName: TABLE_NAME.HOTEL,
})
export class Hotel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  street!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ward!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  district!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  province!: string;

  // @Column({
  //   type: DataType.STRING,
  // })
  // latitude!: string;

  // @Column({
  //   type: DataType.STRING,
  // })
  // longitude!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  contact!: string;

  @HasMany(() => RoomType)
  roomTypes!: RoomType[];

  @HasMany(() => Policy)
  policies!: Policy[];

  @HasMany(() => HotelImage)
  hotelImages!: HotelImage[];

  @HasMany(() => HotelAmenity)
  hotelAmenities!: HotelAmenity[];
}
