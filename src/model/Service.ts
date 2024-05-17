import { Model, Table, Column, DataType } from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.SERVICE,
})
export class Service extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
  })
  description!: string;
}
