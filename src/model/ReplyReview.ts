import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { TABLE_NAME } from "../config/constant.config";
import { Review } from "./Review";
import { Staff } from "./Staff";

@Table({
  tableName: TABLE_NAME.REPLY_REVIEW,
})
export class ReplyReview extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Review)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  review_id!: number;

  @BelongsTo(() => Review)
  review!: Review;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  staff_id!: number;

  @BelongsTo(() => Staff)
  staff!: Staff;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  reply!: string;
}
