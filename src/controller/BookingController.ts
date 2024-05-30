import { Request, Response } from "express";
import { Booking } from "../model/Booking";
import { BookingRepo } from "../repository/BookingRepo";
import ErrorHandler from "../utils/ErrorHandler";
import calculateCost from "../utils/CalculateCost";
import { RoomType } from "../model/RoomType";
import generateRandomString from "../utils/RandomString";
import dayjs from "dayjs";
import { toUpperCase } from "../utils/StringConversion";
import { Policy } from "../model/Policy";
import { Promotion } from "../model/Promotion";
import { Op } from "sequelize";
import {
  BOOKING_STATUS,
  DISCOUNT_TYPE,
  ROOM_STATUS,
} from "../config/enum.config";
import { calculateRoomDiscount } from "../utils/CalculateRoomDiscount";
import { RoomBooking } from "../model/RoomBooking";
import { Room } from "../model/Room";

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
      children_ages,
      base_price,
      room_discount,
      standard_occupant,
      max_children,
      max_occupant,
      max_extra_bed,
      surcharge_rates,
    } = req.body;

    // Validate input
    if (
      typeof num_rooms !== "number" ||
      typeof num_adults !== "number" ||
      typeof num_children !== "number" ||
      !Array.isArray(children_ages) ||
      typeof base_price !== "number" ||
      typeof room_discount !== "number" ||
      typeof standard_occupant !== "number" ||
      typeof max_children !== "number" ||
      typeof max_occupant !== "number" ||
      typeof max_extra_bed !== "number" ||
      typeof surcharge_rates !== "object"
    ) {
      return res.status(400).send("Invalid request data");
    }

    const customerRequest = {
      num_rooms,
      num_adults,
      num_children,
      children_ages,
    };

    const hotelPolicy = {
      base_price,
      room_discount,
      standard_occupant,
      max_children,
      max_occupant,
      max_extra_bed,
      surcharge_rates,
    };

    const result = calculateCost(customerRequest, hotelPolicy);
    res.json(result);
  }

  async createBooking(req: Request, res: Response) {
    try {
      const {
        customer_id,
        check_in,
        check_out,
        num_rooms,
        num_adults,
        num_children,
        children_ages = [],
        hotel_id,
        room_type_id,
      } = req.body;

      const roomType = await RoomType.findOne({
        where: {
          id: room_type_id,
          hotel_id,
        },
      });

      if (!roomType) {
        return res.status(404).json({
          status: 404,
          message: "Room not found!",
        });
      }

      const room_discount = await calculateRoomDiscount(roomType);

      const bookingCode = `${dayjs(Date.now()).format(
        "YYYYMMDDHHmmss"
      )}_${toUpperCase(generateRandomString(8))}`;

      const customerRequest = {
        num_rooms,
        num_adults,
        num_children,
        children_ages,
      };

      const hotelPolicy = {
        base_price: roomType.base_price,
        room_discount,
        standard_occupant: roomType.standard_occupant,
        max_children: roomType.max_children,
        max_occupant: roomType.max_occupant,
        max_extra_bed: roomType.max_extra_bed,
      };

      const hotelPolicies = await Policy.findAll({
        where: {
          hotel_id,
        },
      });

      let hotelTax: number = 0;
      let hotelServiceFee: number = 0;
      let hotelSurChargeRates: { [key: string]: any } = {};

      hotelPolicies.forEach((policy) => {
        if (policy.type === "TAX") {
          hotelTax = Number(policy.value);
        } else if (policy.type === "SERVICE_FEE") {
          hotelServiceFee = Number(policy.value);
        } else if (policy.type === "SURCHARGE_RATES") {
          hotelSurChargeRates = JSON.parse(policy.value);
        }
      });

      const cost = calculateCost(customerRequest, {
        ...hotelPolicy,
        surcharge_rates: hotelSurChargeRates,
      });
      const total_room_price = cost.totalCost;
      const service_fee = Math.round(
        cost.basePrice * num_rooms * (hotelServiceFee / 100)
      );
      const tax = Math.round(
        (total_room_price + service_fee) * (hotelTax / 100)
      );

      const final_price = total_room_price + service_fee + tax;

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);

      // Fetch available rooms of the specified room_type_id
      const availableRooms = await Room.findAll({
        where: {
          room_type_id,
          status: ROOM_STATUS.AVAILABLE,
        },
        order: [["number", "ASC"]], // Order by room number to get rooms with close numbers
      });

      // Ensure there are enough available rooms
      if (availableRooms.length < num_rooms) {
        return res.status(400).json({
          status: 400,
          message: "Not enough available rooms for the specified room type!",
        });
      }

      const newBooking = await Booking.create({
        code: bookingCode,
        customer_id,
        check_in,
        check_out,
        total_room_price,
        tax_and_fee: service_fee + tax,
        status: BOOKING_STATUS.PENDING,
        expires_at: expiresAt,
      });

      // Select the first num_rooms rooms
      const selectedRooms = availableRooms.slice(0, num_rooms);

      // Create room bookings for each selected room
      await Promise.all(
        selectedRooms.map(async (room, index) => {
          const roomData = cost.rooms[index];
          const roomBooking = await RoomBooking.create({
            room_id: room.id,
            booking_id: newBooking.id,
            num_adults: roomData.adults,
            num_children: roomData.children.length,
            children_ages: roomData.children,
            base_price: cost.basePrice,
            surcharge: roomData.surcharges,
            discount: cost.roomDiscount,
            status: ROOM_STATUS.UNAVAILABLE, // Mark room as unavailable
          });

          // Update the room status to unavailable
          room.status = ROOM_STATUS.UNAVAILABLE;
          await room.save();

          return roomBooking;
        })
      );

      return res.status(200).json({
        status: 200,
        message: "Booking created successfully!",
        data: {
          code: bookingCode,
          customer_id,
          check_in,
          check_out,
          num_adults,
          num_children,
          num_rooms,
          total_room_price,
          service_fee,
          tax,
          final_price,
          room_bookings: selectedRooms.map((room, index) => ({
            room_id: room.id,
            num_adults: cost.rooms[index].adults,
            num_children: cost.rooms[index].children.length,
            children_ages: cost.rooms[index].children,
            base_price: cost.basePrice,
            surcharge: cost.rooms[index].surcharges,
            discount: cost.roomDiscount,
          })),
          status: BOOKING_STATUS.PENDING,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
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
