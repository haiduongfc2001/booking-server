import { Model, Table, Column, DataType, IsEmail, Default } from "sequelize-typescript";

@Table({
    tableName: Customer.CUSTOMER_TABLE_NAME,
})
export class Customer extends Model {
    public static CUSTOMER_TABLE_NAME = "customer" as string;
    public static CUSTOMER_ID = "id" as string;
    public static CUSTOMER_USERNAME = "username" as string;
    public static CUSTOMER_PASSWORD = "password" as string;
    public static CUSTOMER_EMAIL = "email" as string;
    public static CUSTOMER_FULL_NAME = "full_name" as string;
    public static CUSTOMER_GENDER = "gender" as const;
    public static CUSTOMER_PHONE = "phone" as string;
    public static CUSTOMER_DOB = "dob" as string;
    public static CUSTOMER_AVATAR = "avatar" as string;
    public static CUSTOMER_ADDRESS = "address" as string;
    public static CUSTOMER_LOCATION = "location" as string;
    public static CUSTOMER_TOKEN = "token" as string;
    public static CUSTOMER_IS_VERIFIED = "is_verified" as string;

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: Customer.CUSTOMER_ID,
    })
    id!: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        // unique: true,
        field: Customer.CUSTOMER_USERNAME,
    })
    username!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: Customer.CUSTOMER_PASSWORD,
    })
    password!: string;

    @IsEmail
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        // unique: true,
        field: Customer.CUSTOMER_EMAIL,
    })
    email!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: Customer.CUSTOMER_FULL_NAME,
    })
    full_name!: string;

    @Column({
        type: DataType.ENUM('male', 'female', 'other'),
        allowNull: false,
        field: Customer.CUSTOMER_GENDER,
    })
    gender!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        // unique: true,
        field: Customer.CUSTOMER_PHONE,
    })
    phone!: string;

    @Column({
        type: DataType.STRING(255),
        field: Customer.CUSTOMER_DOB,
    })
    dob!: string;

    @Column({
        type: DataType.STRING(255),
        field: Customer.CUSTOMER_AVATAR,
    })
    avatar!: string;

    @Column({
        type: DataType.STRING(255),
        field: Customer.CUSTOMER_ADDRESS,
    })
    address!: string;

    @Column({
        type: DataType.STRING(255),
        field: Customer.CUSTOMER_LOCATION,
    })
    location!: string;

    @Column({
        type: DataType.STRING(255),
        field: Customer.CUSTOMER_TOKEN,
    })
    token!: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: Customer.CUSTOMER_IS_VERIFIED,
    })
    is_verified!: boolean;
}