import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Room } from "./Room";
import { Hotel } from "./Hotel";
import { Bed } from "./Bed";
import { RoomImage } from "./RoomImage";

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

  @ForeignKey(() => Hotel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  hotel_id!: number;

  @BelongsTo(() => Hotel)
  hotel!: Hotel;

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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  base_price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  standard_occupant!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  max_children!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      customValidator(value: number) {
        if (value < Number(this.standard_occupant)) {
          throw new Error(
            "max_occupant must be greater than or equal to standard_occupant"
          );
        }
      },
    },
  })
  max_occupant!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  max_extra_bed!: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  views!: string[];

  @Column({
    type: DataType.INTEGER,
  })
  area!: number;

  @HasMany(() => Room)
  rooms!: Room[];

  @HasMany(() => Bed)
  beds!: Bed[];

  @HasMany(() => RoomImage)
  roomImages!: RoomImage[];
}
