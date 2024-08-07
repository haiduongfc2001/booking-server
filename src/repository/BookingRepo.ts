import { Op } from "sequelize";
import { Booking } from "../model/Booking";
import { Customer } from "../model/Customer";
import { Room } from "../model/Room";
import { RoomBooking } from "../model/RoomBooking";
import { BOOKING_STATUS } from "../config/enum.config";

interface IBookingRepo {
  retrieveAll(): Promise<any[]>;
  retrieveById(booking_id: number): Promise<any>;
}

export class BookingRepo implements IBookingRepo {
  private async fetchBooking(booking_id: number): Promise<Booking> {
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      throw new Error("Booking not found!");
    }
    return booking;
  }

  private async fetchCustomer(customer_id: number): Promise<any> {
    const customer = await Customer.findByPk(customer_id);
    return customer
      ? {
          id: customer.id,
          full_name: customer.full_name,
          email: customer.email,
          phone: customer.phone,
        }
      : null;
  }

  private async fetchRoomBookings(booking_id: number): Promise<any[]> {
    const roomBookings: RoomBooking[] = await RoomBooking.findAll({
      where: { booking_id },
    });

    const roomBookingsWithRoom = await Promise.all(
      roomBookings.map(async (roomBooking) => {
        const room = await Room.findByPk(roomBooking.room_id);
        return {
          ...roomBooking.toJSON(),
          room_number: room ? room.number : null,
        };
      })
    );

    return roomBookingsWithRoom;
  }

  private async getBookingData(booking: Booking): Promise<any> {
    const customerData = await this.fetchCustomer(booking.customer_id);

    const roomBookings = await this.fetchRoomBookings(booking.id);

    const num_adults = roomBookings.reduce(
      (total, roomBooking) => total + roomBooking.num_adults,
      0
    );
    const num_children = roomBookings.reduce(
      (total, roomBooking) => total + roomBooking.num_children,
      0
    );

    const bookingData = {
      ...booking.toJSON(),
      num_adults,
      num_children,
      total_cost: booking.total_room_price + booking.tax_and_fee,
      customer: customerData,
      roomBookings: roomBookings.length > 0 ? roomBookings : null,
    };

    delete bookingData.customer_id;

    return bookingData;
  }

  async retrieveAll(): Promise<any[]> {
    try {
      const bookings: Booking[] = await Booking.findAll({
        order: [["id", "asc"]],
      });

      const bookingsWithRoomBookings = await Promise.all(
        bookings.map(async (booking) => this.getBookingData(booking))
      );

      return bookingsWithRoomBookings;
    } catch (error) {
      throw new Error("Failed to retrieve all bookings!");
    }
  }

  async retrieveById(booking_id: number): Promise<any> {
    try {
      const booking = await this.fetchBooking(booking_id);
      return this.getBookingData(booking);
    } catch (error) {
      throw new Error("Failed to retrieve the booking!");
    }
  }

  async countBookingsByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const count = await Booking.count({
      where: {
        status: {
          [Op.in]: [
            BOOKING_STATUS.CONFIRMED,
            BOOKING_STATUS.CHECKED_IN,
            BOOKING_STATUS.CHECKED_OUT,
          ],
        },
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      distinct: true,
    });

    return count;
  }

  /**
   * Tính tổng doanh thu từ các đặt phòng trong một tháng và năm cụ thể.
   *
   * @param {number} year - Năm cần tính doanh thu
   * @param {number} month - Tháng cần tính doanh thu (0-11)
   * @returns {Promise<number>} - Tổng doanh thu
   */
  async getBookingRevenue(year: number, month: number): Promise<number> {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      const totalRoomPrice = await Booking.sum("total_room_price", {
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
          created_at: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
        },
      });

      const totalTaxAndFee = await Booking.sum("tax_and_fee", {
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
          created_at: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
        },
      });

      const totalRevenue = (totalRoomPrice || 0) + (totalTaxAndFee || 0);

      return totalRevenue;
    } catch (error) {
      console.error("Error calculating booking revenue:", error);
      throw new Error("Error calculating booking revenue");
    }
  }
}
