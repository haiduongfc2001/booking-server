import { Booking } from "../model/Booking";
import { Customer } from "../model/Customer";
import { Room } from "../model/Room";
import { RoomBooking } from "../model/RoomBooking";

interface IBookingRepo {
  retrieveAll(): Promise<any[]>;
}

export class BookingRepo implements IBookingRepo {
  async retrieveAll(): Promise<any[]> {
    try {
      const bookings: Booking[] = await Booking.findAll({
        order: [["id", "asc"]],
      });

      const bookingsWithRoomBookings = await Promise.all(
        bookings.map(async (booking) => {
          const customer = await Customer.findByPk(booking.customer_id);
          const roomBookings = await RoomBooking.findAll({
            where: {
              booking_id: booking.id,
            },
          });

          // Convert the booking to JSON and remove customer_id
          const { customer_id, ...bookingData } = booking.toJSON();

          // Select only the desired fields from the customer data
          const customerData = customer ? customer.toJSON() : null;
          const filteredCustomerData = customerData
            ? {
              id: customerData.id,
              full_name: customerData.full_name,
              email: customerData.email,
              phone: customerData.phone,
            }
            : null;

          // Map room bookings with room data
          const roomBookingsWithRoom = await Promise.all(
            roomBookings.map(async (roomBooking) => {
              const room = await Room.findByPk(roomBooking.room_id);
              const { room_id, booking_id, ...roomBookingData } = roomBooking.toJSON();
              return {
                ...roomBookingData,
                room_number: room ? room.number : null,
              };
            })
          );

          return {
            ...bookingData,
            customer: filteredCustomerData,
            roomBookings: roomBookingsWithRoom,
          };
        })
      );

      return bookingsWithRoomBookings;
    } catch (error) {
      throw new Error("Failed to retrieve all bookings!");
    }
  }
}
