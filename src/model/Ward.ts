import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { District } from "./District";

@Table({
  tableName: Ward.WARD_TABLE_NAME,
})
export class Ward extends Model {
  public static WARD_TABLE_NAME = "ward" as string;
  public static WARD_ID = "id" as string;
  public static WARD_NAME = "name" as string;
  public static WARD_LEVEL = "level" as string;
  public static DISTRICT_ID = "district_id" as string;

  @Column({
    type: DataType.STRING(10),
    primaryKey: true,
    field: Ward.WARD_ID,
  })
  id!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    // unique: true,
    field: Ward.WARD_NAME,
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: Ward.WARD_LEVEL,
  })
  level!: string;

  @ForeignKey(() => District)
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    field: Ward.DISTRICT_ID,
  })
  district_id!: string;

  @BelongsTo(() => District, "district_id")
  district!: District;
}
