import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Booking } from "./Booking";
import { Customer } from "./Customer";

@Table({
  tableName: "review",
})
export class Review extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Booking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  booking_id!: number;

  @BelongsTo(() => Booking)
  booking!: Booking;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  customer_id!: number;

  @BelongsTo(() => Customer)
  customer!: Customer;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  })
  location_rating!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  })
  price_rating!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  })
  service_rating!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  })
  cleanliness_rating!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  })
  amenities_rating!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comment!: string;
}
