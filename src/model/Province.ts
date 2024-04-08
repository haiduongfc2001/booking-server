import { Model, Table, Column, DataType } from "sequelize-typescript";

@Table({
    tableName: Province.PROVINCE_TABLE_NAME,
})
export class Province extends Model {
    public static PROVINCE_TABLE_NAME = "province" as string;
    public static PROVINCE_ID = "id" as string;
    public static PROVINCE_NAME = "name" as string;
    public static PROVINCE_LEVEL = "level" as string;

    @Column({
        type: DataType.STRING(10),
        primaryKey: true,
        field: Province.PROVINCE_ID,
    })
    id!: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        // unique: true,
        field: Province.PROVINCE_NAME,
    })
    name!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: Province.PROVINCE_LEVEL,
    })
    level!: string;
}