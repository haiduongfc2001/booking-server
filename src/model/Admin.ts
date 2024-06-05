import { Model, Table, Column, DataType, IsEmail } from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.ADMIN,
})
export class Admin extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @IsEmail
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING,
  })
  token!: string;
}
