import { Request, Response } from "express";
import { Booking } from "../model/Booking";
import { BookingRepo } from "../repository/BookingRepo";
import ErrorHandler from "../utils/ErrorHandler";
import calculateCost from "../utils/CalculateCost";
import { RoomType } from "../model/RoomType";
import generateRandomString from "../utils/RandomString";
import dayjs from "dayjs";
import { toUpperCase } from "../utils/StringConversion";

interface Child {
  age: number;
  fee: number;
}

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

  async calculateMinCost(req: Request, res: Response) {
    const {
      num_rooms,
      num_adults,
      num_children,
      room_price,
      room_discount,
      max_occupant,
      standard_occupant,
      max_children,
      surcharge_rates,
    } = req.body;

    // Validate input
    if (
      typeof num_rooms !== "number" ||
      typeof num_adults !== "number" ||
      !Array.isArray(num_children) ||
      typeof room_price !== "number" ||
      typeof room_discount !== "number" ||
      typeof max_occupant !== "number" ||
      typeof standard_occupant !== "number" ||
      typeof max_children !== "number" ||
      typeof surcharge_rates !== "object"
    ) {
      return res.status(400).send("Invalid request data");
    }

    const customerRequest = {
      num_rooms,
      num_adults,
      num_children,
    };

    const hotelPolicy = {
      room_price,
      room_discount,
      max_occupant,
      standard_occupant,
      max_children,
      surcharge_rates,
    };

    const result = calculateCost(customerRequest, hotelPolicy);
    res.json(result);
  }
}

export default new BookingController();

/**
  const priceKeyObject = {
	  originalPrice: 1000000,
	  discountedPrice: 120000,
	  bookingStartTime: 1716651196079,
	  priceHoldDuration: 1716652155560,
  };

  // const priceKey = encodeJsonObject(priceKeyObject);
  const priceKey = decodeJsonObject(
	"nej9kzIAoQzCcXcF7628JQ==:hfkqBiwQXgY6+RLxQBigc0HjmIK+j2Z+o/Y/tK3Ff+OXepk/GFM/8TIJ4BgVHprKk8hsYbDUTdaxY5+ALw69vhRHANhAOmu6kqptAS0DsFhZvh7U/hmG862dtW5PCFDE+o/MUVxbp67cyQB4lV5qDHHBTw44xw+D6IozBTmwUUs="
  );
  console.log(priceKey);
 */

/**
{
    "room_type_id": "258262",
    "room_key": "49697%3A29083%3A9942%3ATA_INSTANT%3A1%3A17%3ANORMAL%3AREQUEST%3AN%3Anull%3AOTA_REQUEST-OTA-TA_INSTANT-TA_REQUEST%3A1174873%3Anull",
    "promotion_code": "CHAOHE2024",
    "check_in": "29-05-2024",
    "check_out": "30-05-2024",
    "num_adults": 2,
    "num_children": 2,
    "num_rooms": 1,
    "hotel_id": 49697,
    "children_ages": [17, 4],
    "price_key": "E8z98dPhvRfLAQ+FrpctGA==:Ttj77F/G7ST9dKvUxSxr+A41eKgbYMbE9WQtVWw61x3K4nVD9nMRZ+4iU52w+6xQ/5/Mp8IkkaY1c8Yc75X0xwHWKPdIrMoK3/bCWWl+X8GDhzZMujz28GlKJJ6eOo2fNV7aZPIRwUF82aHQK7ulaULHcDPJtQ1B7I5hMcVJows="
}
*/
