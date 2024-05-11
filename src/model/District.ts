import {
	Model,
	Table,
	Column,
	DataType,
	ForeignKey,
	BelongsTo,
} from "sequelize-typescript";
import { Province } from "./Province";

@Table({
	tableName: District.DISTRICT_TABLE_NAME,
})
export class District extends Model {
	public static DISTRICT_TABLE_NAME = "district" as string;
	public static DISTRICT_ID = "id" as string;
	public static DISTRICT_NAME = "name" as string;
	public static DISTRICT_LEVEL = "level" as string;
	public static PROVINCE_ID = "province_id" as string;

	@Column({
		type: DataType.STRING(10),
		primaryKey: true,
		field: District.DISTRICT_ID,
	})
	id!: string;

	@Column({
		type: DataType.STRING(100),
		allowNull: false,
		// unique: true,
		field: District.DISTRICT_NAME,
	})
	name!: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
		field: District.DISTRICT_LEVEL,
	})
	level!: string;

	@ForeignKey(() => Province)
	@Column({
		type: DataType.STRING(10),
		allowNull: false,
		field: District.PROVINCE_ID,
	})
	province_id!: string;

	@BelongsTo(() => Province, "province_id")
	province!: Province;
}
