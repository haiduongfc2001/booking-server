import { Model, Table, Column, DataType } from "sequelize-typescript";

@Table({
  tableName: Service.SERVICE_TABLE_NAME,
})
export class Service extends Model {
  public static SERVICE_TABLE_NAME = "service" as string;
  public static SERVICE_ID = "id" as string;
  public static SERVICE_NAME = "name" as string;
  public static SERVICE_DESCRIPTION = "description" as string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: Service.SERVICE_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    field: Service.SERVICE_NAME,
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    field: Service.SERVICE_DESCRIPTION,
  })
  description!: string;
}
