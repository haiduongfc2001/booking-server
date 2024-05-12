import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
  Validate,
} from "sequelize-typescript";
import { Room } from "./Room";

@Table({
  tableName: Promotion.TABLE_NAME,
})
export class Promotion extends Model {
  public static TABLE_NAME = "promotion" as string;
  public static PROMOTION_ID = "id" as string;
  public static ROOM_ID = "room_id" as string;
  public static PROMOTION_CODE = "code" as string;
  public static PROMOTION_DISCOUNT_TYPE = "discount_type" as const;
  public static PROMOTION_DISCOUNT_VALUE = "discount_value" as string;
  public static PROMOTION_START_DATE = "start_date" as string;
  public static PROMOTION_END_DATE = "end_date" as string;
  public static PROMOTION_IS_ACTIVE = "is_active" as string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_id!: number;

  @BelongsTo(() => Room)
  room!: Room;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  code!: string;

  @Column({
    type: DataType.ENUM("percentage", "fixed_amount"),
    allowNull: false,
  })
  discount_type!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      customValidator(value: number) {
        if (
          this.discount_type === "percentage" &&
          (value <= 0 || value > 100)
        ) {
          throw new Error(
            "Discount value must be between 0 and 100 for percentage type!"
          );
        } else if (this.discount_type === "fixed_amount" && value <= 0) {
          throw new Error("Discount value must be greater than 0!");
        }
      },
    },
  })
  discount_value!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  start_date!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  end_date!: Date;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_active!: boolean;
}
