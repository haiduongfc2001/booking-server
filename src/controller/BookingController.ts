import { Request, Response } from "express";
import { Booking } from "../model/Booking";
import { BookingRepo } from "../repository/BookingRepo";
import ErrorHandler from "../utils/ErrorHandler";

class BookingController {
	async getAllBookings(req: Request, res: Response) {
		try {
			const bookings = await new BookingRepo().retrieveAll();

			return res.status(200).json({
				status: 200,
				message: "Successfully fetched all booking data!",
				data: bookings,
			});
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}

	async getBookingById(req: Request, res: Response) {
	  try {
		const booking_id = parseInt(req.params.booking_id);
  
		const booking = await Booking.findByPk(booking_id);
  
		if (!booking) {
		  return res.status(404).json({
			status: 404,
			message: "Booking not found!",
		  });
		}
  
		const bookingInfo = await new BookingRepo().retrieveById(booking_id);
  
		return res.status(200).json({
		  status: 200,
		  message: `Successfully fetched booking by id ${booking_id}!`,
		  data: bookingInfo,
		});
	  } catch (error) {
		return ErrorHandler.handleServerError(res, error);
	  }
	}
}

export default new BookingController();
