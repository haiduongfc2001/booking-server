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
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  full_name!: string;

  @Column({
    type: DataType.ENUM(...Object.values(GENDER)),
    allowNull: false,
  })
  gender!: GENDER;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    // unique: true,
  })
  phone!: string;

  @Column({
    type: DataType.STRING(255),
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
    type: DataType.ENUM(...Object.values(STAFF_ROLE)),
    allowNull: false,
  })
  role!: STAFF_ROLE;

  @Column({
    type: DataType.STRING(255),
  })
  token!: string;
}
