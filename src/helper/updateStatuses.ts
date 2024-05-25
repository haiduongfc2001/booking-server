import { BOOKING_STATUS, ROOM_STATUS } from "../config/enum.config";
import { Booking } from "../model/Booking";
import { Room } from "../model/Room";
import { RoomBooking } from "../model/RoomBooking";
import { Op } from "sequelize";

export const updateRoomStatus = async (): Promise<void> => {
  const now = new Date();

  const bookingsToCheckOut = await Booking.findAll({
    where: {
      check_out: {
        [Op.lt]: now,
      },
      status: {
        [Op.ne]: BOOKING_STATUS.CHECKED_OUT,
      },
    },
  });

  await Promise.all(
    bookingsToCheckOut.map(async (booking) => {
      booking.status = BOOKING_STATUS.CHECKED_OUT;
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
            room.status = ROOM_STATUS.AVAILABLE;
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
        if ([BOOKING_STATUS.CANCELED, BOOKING_STATUS.CHECKED_OUT].includes(booking.status)) {
          room.status = ROOM_STATUS.AVAILABLE;
        } else {
          room.status = ROOM_STATUS.UNAVAILABLE;
        }
        await room.save();
      }
    })
  );
};
