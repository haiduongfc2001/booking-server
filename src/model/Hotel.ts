import { Model, Table, Column, DataType, HasMany } from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Room } from "./Room";

@Table({
	tableName: TABLE_NAME.HOTEL,
})
export class Hotel extends Model {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	})
	id!: number;

	@Column({
		type: DataType.STRING(100),
		allowNull: false,
	})
	name!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	address!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	location!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	description!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	contact!: string;

	@HasMany(() => Room)
	rooms!: Room[];
}
