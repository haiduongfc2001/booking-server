import { Model, Table, Column, DataType } from "sequelize-typescript";

@Table({
	tableName: Hotel.HOTEL_TABLE_NAME,
})
export class Hotel extends Model {
	public static HOTEL_TABLE_NAME = "hotel" as string;
	public static HOTEL_ID = "id" as string;
	public static HOTEL_NAME = "name" as string;
	public static HOTEL_ADDRESS = "address" as string;
	public static HOTEL_LOCATION = "location" as string;
	public static HOTEL_DESCRIPTION = "description" as string;
	public static HOTEL_CONTACT = "contact" as string;

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
		field: Hotel.HOTEL_NAME,
	})
	name!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
		field: Hotel.HOTEL_ADDRESS,
	})
	address!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
		field: Hotel.HOTEL_LOCATION,
	})
	location!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
		field: Hotel.HOTEL_DESCRIPTION,
	})
	description!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
		field: Hotel.HOTEL_CONTACT,
	})
	contact!: string;
}
