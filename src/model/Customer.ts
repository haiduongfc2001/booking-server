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
		type: DataType.STRING,
		allowNull: false,
	})
	full_name!: string;

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
		type: DataType.ENUM(GENDER.MALE, GENDER.FEMALE, GENDER.OTHER),
		allowNull: false,
	})
	gender!: GENDER;

	@Column({
		type: DataType.STRING,
	})
	phone!: string;

	@Column({
		type: DataType.STRING,
	})
	dob!: string;

	@Column({
		type: DataType.STRING,
	})
	avatar!: string;

	@Column({
		type: DataType.STRING,
	})
	address!: string;

	@Column({
		type: DataType.STRING,
	})
	location!: string;

	@Column({
		type: DataType.STRING,
	})
	token!: string;

	@Default(false)
	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
	})
	is_verified!: boolean;
}
