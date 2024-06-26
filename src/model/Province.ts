import { Model, Table, Column, DataType, HasMany } from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { District } from "./District";

@Table({
  tableName: TABLE_NAME.PROVINCE,
})
export class Province extends Model {
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
    type: DataType.STRING,
    allowNull: false,
  })
  level!: string;

  @HasMany(() => District)
  districts!: District[];
}
