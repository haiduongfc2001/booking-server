import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Room } from "./Room";
import { BED_TYPE } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";

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

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id!: number;

  @BelongsTo(() => Room)
  room!: Room;

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
  })
  quantity!: number;
}
