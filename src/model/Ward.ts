import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { District } from "./District";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.WARD,
})
export class Ward extends Model {
  @Column({
    type: DataType.STRING(10),
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  level!: string;

  @ForeignKey(() => District)
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  district_id!: string;

  @BelongsTo(() => District, "district_id")
  district!: District;
}
