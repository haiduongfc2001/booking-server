import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { RoomType } from "./RoomType";
import { DISCOUNT_TYPE } from "../config/enum.config";
import { TABLE_NAME } from "../config/constant.config";

@Table({
  tableName: TABLE_NAME.PROMOTION,
})
export class Promotion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => RoomType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  room_type_id!: number;

  @BelongsTo(() => RoomType)
  roomType!: RoomType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  code!: string;

  @Column({
    type: DataType.ENUM(DISCOUNT_TYPE.PERCENTAGE, DISCOUNT_TYPE.FIXED_AMOUNT),
    allowNull: false,
  })
  discount_type!: DISCOUNT_TYPE;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      customValidator(value: number) {
        if (
          this.discount_type === DISCOUNT_TYPE.PERCENTAGE &&
          (value <= 0 || value > 100)
        ) {
          throw new Error(
            "Discount value must be between 0 and 100 for PERCENTAGE type!"
          );
        } else if (
          this.discount_type === DISCOUNT_TYPE.FIXED_AMOUNT &&
          value <= 0
        ) {
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
