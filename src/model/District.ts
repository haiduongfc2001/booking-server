import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Province } from "./Province";
import { TABLE_NAME } from "../config/constant.config";
import { Ward } from "./Ward";

@Table({
  tableName: TABLE_NAME.DISTRICT,
})
export class District extends Model {
  @Column({
    type: DataType.STRING(10),
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    // unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  level!: string;

  @ForeignKey(() => Province)
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  province_id!: string;

  @BelongsTo(() => Province)
  province!: Province;

  @HasMany(() => Ward)
  wards!: Ward[];
}
