import {
  Model,
  Table,
  Column,
  DataType,
  IsEmail,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Hotel } from "./Hotel";
import { GENDER, STAFF_ROLE } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.STAFF,
})
export class Staff extends Model {
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
    allowNull: false,
  })
  full_name!: string;

  @Column({
    type: DataType.ENUM(GENDER.MALE, GENDER.FEMALE, GENDER.OTHER),
    allowNull: false,
  })
  gender!: GENDER;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    // unique: true,
  })
  phone!: string;

  @Column({
    type: DataType.STRING,
  })
  avatar!: string;

  @ForeignKey(() => Hotel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  hotel_id!: number;

  @BelongsTo(() => Hotel, "hotel_id")
  hotel!: Hotel;

  @Column({
    type: DataType.ENUM(STAFF_ROLE.MANAGER, STAFF_ROLE.RECEPTIONIST),
    allowNull: false,
  })
  role!: STAFF_ROLE;

  @Column({
    type: DataType.STRING,
  })
  token!: string;
}
