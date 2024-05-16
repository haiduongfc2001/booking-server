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
          // Retrieve customer data
          const customer = await Customer.findByPk(booking.customer_id);
          const filteredCustomerData = customer
            ? {
                id: customer.id,
                full_name: customer.full_name,
                email: customer.email,
                phone: customer.phone,
              }
            : null;

          // Calculate total cost
          const totalCost = booking.total_room_price + booking.tax_and_fee;

          // Retrieve room bookings
          const roomBookings: RoomBooking[] = await RoomBooking.findAll({
            where: {
              booking_id: booking.id,
            },
          });

          // Calculate the total number of adults and children
          const num_adults = roomBookings.reduce(
            (total, roomBooking) => total + roomBooking.num_adults,
            0
          );
          const num_children = roomBookings.reduce(
            (total, roomBooking) => total + roomBooking.num_children,
            0
          );

          // Map room bookings with room data
          const roomBookingsWithRoom = await Promise.all(
            roomBookings.map(async (roomBooking) => {
              const room = await Room.findByPk(roomBooking.room_id);
              return {
                ...roomBooking.toJSON(),
                room_number: room ? room.number : null,
              };
            })
          );

          // Convert the booking to JSON and remove customer_id
          const bookingData = {
            ...booking.toJSON(),
            num_adults,
            num_children,
            total_cost: totalCost,
            customer: filteredCustomerData,
            roomBookings:
              roomBookingsWithRoom.length > 0 ? roomBookingsWithRoom : null,
          };

          delete bookingData.customer_id;

          return bookingData;
        })
      );

      return bookingsWithRoomBookings;
    } catch (error) {
      throw new Error("Failed to retrieve all bookings!");
    }
  }
}
