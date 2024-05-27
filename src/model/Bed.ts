import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { BED_TYPE } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";
import { RoomType } from "./RoomType";

@Table({
  tableName: TABLE_NAME.BED,
})
export class Bed extends Model {
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
    type: DataType.ENUM(
      BED_TYPE.SINGLE,
      BED_TYPE.DOUBLE,
      BED_TYPE.QUEEN,
      BED_TYPE.KING,
      BED_TYPE.TWIN,
      BED_TYPE.FULL,
      BED_TYPE.CALIFORNIA_KING,
      BED_TYPE.SOFA_BED,
      BED_TYPE.BUNK_BED,
      BED_TYPE.ROLL_AWAY,
      BED_TYPE.MURPHY_BED
    ),
    allowNull: false,
  })
  type!: BED_TYPE;

  @Column({
    type: DataType.STRING,
  })
  description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  quantity!: number;
}
