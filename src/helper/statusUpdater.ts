import { Booking } from "../model/Booking";
import { Room } from "../model/Room";
import { RoomBooking } from "../model/RoomBooking";
import { Op } from "sequelize";

export const updateStatuses = async (): Promise<void> => {
  const now = new Date();

  const bookingsToCheckOut = await Booking.findAll({
    where: {
      check_out: {
        [Op.lt]: now,
      },
      status: {
        [Op.ne]: "checked_out",
      },
    },
  });

  await Promise.all(
    bookingsToCheckOut.map(async (booking) => {
      booking.status = "checked_out";
      await booking.save();

      const roomBookings = await RoomBooking.findAll({
        where: {
          booking_id: booking.id,
        },
      });

      await Promise.all(
        roomBookings.map(async (roomBooking) => {
          const room = await Room.findByPk(roomBooking.room_id);
          if (room) {
            room.status = "available";
            await room.save();
          }
        })
      );
    })
  );

  const allRoomBookings = await RoomBooking.findAll();

  await Promise.all(
    allRoomBookings.map(async (roomBooking) => {
      const booking = await Booking.findByPk(roomBooking.booking_id);
      const room = await Room.findByPk(roomBooking.room_id);

      if (room && booking) {
        if (["canceled", "checked_out"].includes(booking.status)) {
          room.status = "available";
        } else {
          room.status = "unavailable";
        }
        await room.save();
      }
    })
  );
};
