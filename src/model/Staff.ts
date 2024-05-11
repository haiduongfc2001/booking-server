import {
  Model,
  Table,
  Column,
  DataType,
  IsEmail,
} from "sequelize-typescript";

@Table({
  tableName: Staff.STAFF_TABLE_NAME,
})
export class Staff extends Model {
  public static STAFF_TABLE_NAME = "staff" as string;
  public static STAFF_ID = "id" as string;
  public static STAFF_EMAIL = "email" as string;
  public static STAFF_PASSWORD = "password" as string;
  public static STAFF_FULL_NAME = "full_name" as string;
  public static STAFF_GENDER = "gender" as const;
  public static STAFF_PHONE = "phone" as string;
  public static STAFF_AVATAR = "avatar" as string;
  public static STAFF_HOTEL_ID = "hotel_id" as string;
  public static STAFF_ROLE = "role" as const;
  public static STAFF_TOKEN = "token" as string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: Staff.STAFF_ID,
  })
  id!: number;

  @IsEmail
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    // unique: true,
    field: Staff.STAFF_EMAIL,
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: Staff.STAFF_PASSWORD,
  })
  password!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: Staff.STAFF_FULL_NAME,
  })
  full_name!: string;

  @Column({
    type: DataType.ENUM("male", "female", "other"),
    allowNull: false,
    field: Staff.STAFF_GENDER,
  })
  gender!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    // unique: true,
    field: Staff.STAFF_PHONE,
  })
  phone!: string;

  @Column({
    type: DataType.STRING(255),
    field: Staff.STAFF_AVATAR,
  })
  avatar!: string;

  @Column({
    type: DataType.INTEGER,
    field: Staff.STAFF_HOTEL_ID,
  })
  hotel_id!: number;

  @Column({
    type: DataType.ENUM("manager", "receptionist"),
    allowNull: false,
    field: Staff.STAFF_ROLE,
  })
  role!: string;

  @Column({
    type: DataType.STRING(255),
    field: Staff.STAFF_TOKEN,
  })
  token!: string;
}
