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
}

export default new BookingController();
