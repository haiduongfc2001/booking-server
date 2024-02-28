import { Model, Table, Column, DataType, IsEmail, Default } from "sequelize-typescript";

@Table({
    tableName: Hotel.HOTEL_TABLE_NAME,
})
export class Hotel extends Model {
    public static HOTEL_TABLE_NAME = "hotel" as string;
    public static HOTEL_ID = "id" as string;
    public static HOTEL_USERNAME = "username" as string;
    public static HOTEL_PASSWORD = "password" as string;
    public static HOTEL_EMAIL = "email" as string;
    public static HOTEL_FULL_NAME = "full_name" as string;
    public static HOTEL_GENDER = "gender" as const;
    public static HOTEL_PHONE = "phone" as string;
    public static HOTEL_AVATAR_URL = "avatar_url" as string;
    public static HOTEL_ADDRESS = "address" as string;
    public static HOTEL_LOCATION = "location" as string;
    public static HOTEL_ROLE = "role" as string;
    public static HOTEL_IS_VERIFIED = "is_verified" as string;
    public static HOTEL_TOKEN = "token" as string;

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: Hotel.HOTEL_ID,
    })
    id!: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        // unique: true,
        field: Hotel.HOTEL_USERNAME,
    })
    username!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: Hotel.HOTEL_PASSWORD,
    })
    password!: string;

    @IsEmail
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        // unique: true,
        field: Hotel.HOTEL_EMAIL,
    })
    email!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: Hotel.HOTEL_FULL_NAME,
    })
    full_name!: string;

    @Column({
        type: DataType.ENUM('male', 'female', 'other'),
        allowNull: false,
        field: Hotel.HOTEL_GENDER,
    })
    gender!: any;


    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        // unique: true,
        field: Hotel.HOTEL_PHONE,
    })
    phone!: string;

    @Column({
        type: DataType.STRING(255),
        field: Hotel.HOTEL_AVATAR_URL,
    })
    avatar_url!: string;

    @Column({
        type: DataType.STRING(255),
        field: Hotel.HOTEL_ADDRESS,
    })
    address!: string;

    @Column({
        type: DataType.STRING(255),
        field: Hotel.HOTEL_LOCATION,
    })
    location!: string;

    @Default('hotel')
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: Hotel.HOTEL_ROLE,
    })
    role!: string;

    @Column({
        type: DataType.STRING(255),
        field: Hotel.HOTEL_TOKEN,
    })
    token!: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: Hotel.HOTEL_IS_VERIFIED,
    })
    is_verified!: boolean;
}