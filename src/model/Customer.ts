import {
	Model,
	Table,
	Column,
	DataType,
	IsEmail,
	Default,
} from "sequelize-typescript";
import { GENDER } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";

@Table({
	tableName: TABLE_NAME.CUSTOMER,
})
export class Customer extends Model {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	})
	id!: number;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
	})
	full_name!: string;

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
		type: DataType.ENUM(...Object.values(GENDER)),
		allowNull: false,
	})
	gender!: GENDER;

	@Column({
		type: DataType.STRING(255),
		allowNull: true,
	})
	phone!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: true,
	})
	dob!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: true,
	})
	avatar!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: true,
	})
	address!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: true,
	})
	location!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: true,
	})
	token!: string;

	@Default(false)
	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
	})
	is_verified!: boolean;
}