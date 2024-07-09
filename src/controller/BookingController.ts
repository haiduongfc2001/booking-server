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
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  ROOM_STATUS,
} from "../config/enum.config";
import { calculateRoomDiscount } from "../utils/CalculateRoomDiscount";
import { RoomBooking } from "../model/RoomBooking";
import { Room } from "../model/Room";
import calculateNumberOfNights from "../utils/CalculateNumNights";
import { Hotel } from "../model/Hotel";
import { Bed } from "../model/Bed";
import { Customer } from "../model/Customer";
import { HotelImage } from "../model/HotelImage";
import { RoomImage } from "../model/RoomImage";
import { minioConfig } from "../config/minio.config";
import { DEFAULT_MINIO, PAGINATION } from "../config/constant.config";
import { translate } from "../utils/Translation";
import { Payment } from "../model/Payment";
import { PaymentMethod } from "../model/PaymentMethod";
import { Refund } from "../model/Refund";
import { Review } from "../model/Review";
import { Op, OrderItem } from "sequelize";

interface Child {
  age: number;
  fee: number;
}

const sortOptionMap = {
  NEWEST: ["created_at", "DESC"],
  OLDEST: ["created_at", "ASC"],
  CANCELLED: ["created_at", "DESC"],
  CONFIRMED: ["created_at", "DESC"],
  CHECKED_IN: ["created_at", "DESC"],
  CHECKED_OUT: ["created_at", "DESC"],
} as const;

type SortOption = keyof typeof sortOptionMap;

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

      const booking = await Booking.findByPk(booking_id, {
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                    include: [
                      { model: Hotel, include: [{ model: HotelImage }] },
                      { model: Bed },
                      { model: RoomImage },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: Customer,
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({
          status: 404,
          message: "Booking not found!",
        });
      }

      const updatedRoomBookings = await Promise.all(
        booking.roomBookings.map(async (roomBooking) => {
          const updatedRoom = {
            ...roomBooking.room.toJSON(),
            roomType: {
              ...roomBooking.room.roomType.toJSON(),
              roomImages: await Promise.all(
                roomBooking.room.roomType.roomImages.map(async (image) => {
                  const presignedUrl = await new Promise<string>(
                    (resolve, reject) => {
                      minioConfig
                        .getClient()
                        .presignedGetObject(
                          DEFAULT_MINIO.BUCKET,
                          `${DEFAULT_MINIO.HOTEL_PATH}/${roomBooking.room.roomType.hotel.id}/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${roomBooking.room.roomType.id}/${image.url}`,
                          24 * 60 * 60,
                          (err, presignedUrl) => {
                            if (err) reject(err);
                            else resolve(presignedUrl);
                          }
                        );
                    }
                  );

                  return {
                    ...image.toJSON(),
                    url: presignedUrl,
                  };
                })
              ),
              hotel: {
                ...roomBooking.room.roomType.hotel.toJSON(),
                hotelImages: await Promise.all(
                  roomBooking.room.roomType.hotel.hotelImages.map(
                    async (image) => {
                      const presignedUrl = await new Promise<string>(
                        (resolve, reject) => {
                          minioConfig
                            .getClient()
                            .presignedGetObject(
                              DEFAULT_MINIO.BUCKET,
                              `${DEFAULT_MINIO.HOTEL_PATH}/${roomBooking.room.roomType.hotel.id}/${image.url}`,
                              24 * 60 * 60,
                              (err, presignedUrl) => {
                                if (err) reject(err);
                                else resolve(presignedUrl);
                              }
                            );
                        }
                      );

                      return {
                        ...image.toJSON(),
                        url: presignedUrl,
                      };
                    }
                  )
                ),
              },
            },
          };

          return {
            ...roomBooking.toJSON(),
            room: updatedRoom,
          };
        })
      );

      const payment = await Payment.findOne({
        where: { booking_id: booking.id },
        include: [{ model: PaymentMethod }],
      });

      const bookingInfo = {
        ...booking.toJSON(),
        roomBookings: updatedRoomBookings,
        translateStatus: translate("bookingStatus", booking.status),
        totalAdults: booking.roomBookings.reduce(
          (sum, roomBooking) => sum + roomBooking.num_adults,
          0
        ),
        totalChildren: booking.roomBookings.reduce(
          (sum, roomBooking) => sum + roomBooking.num_children,
          0
        ),
        totalPrice: booking.total_room_price + booking.tax_and_fee,
      };

      if (!payment) {
        return res.status(200).json({
          status: 200,
          message: "Đơn hàng chưa được thanh toán!",
          data: {
            ...bookingInfo,
            payment: {
              status: PAYMENT_STATUS.FAILED,
              translateStatus: "Chưa thanh toán",
            },
          },
        });
      }

      const refund = await Refund.findOne({
        where: { payment_id: payment.id },
      });

      const review = await Review.findOne({
        where: { booking_id, customer_id: booking.customer_id },
      });

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched booking by id ${booking_id}!`,
        data: {
          ...bookingInfo,
          payment: {
            ...payment.toJSON(),
            translateStatus: translate("paymentStatus", payment.status),
            refund: refund
              ? {
                  ...refund.toJSON(),
                  translateStatus: translate("refundStatus", refund.status),
                }
              : null,
          },
          review: review
            ? {
                ...review.toJSON(),
              }
            : null,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async calculateMinCost(req: Request, res: Response) {
    const {
      check_in,
      check_out,
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
      service_fee,
      tax,
    } = req.body;

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
      typeof surcharge_rates !== "object" ||
      typeof service_fee !== "number" ||
      typeof tax !== "number"
    ) {
      return res.status(400).send("Invalid request data");
    }

    const num_nights = calculateNumberOfNights(check_in, check_out);

    const customerRequest = {
      num_rooms,
      num_adults,
      num_nights,
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
      service_fee,
      tax,
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
        note = "",
      } = req.body;

      const customer = await Customer.findByPk(customer_id);

      if (!customer) {
        return res.status(404).json({
          status: 404,
          message: "Customer not found!",
        });
      }

      const hotel = await Hotel.findByPk(hotel_id, {
        include: [
          {
            model: RoomType,
            where: { id: room_type_id },
            include: [Bed, RoomImage],
          },
          {
            model: HotelImage,
          },
          {
            model: Policy,
          },
        ],
      });

      if (!hotel || !hotel.roomTypes || hotel.roomTypes.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Room not found!",
        });
      }

      const roomType = hotel.roomTypes[0];

      const room_discount = await calculateRoomDiscount(roomType);

      const bookingCode = `${dayjs(Date.now()).format(
        "YYYYMMDDHHmmss"
      )}_${toUpperCase(generateRandomString(8))}`;

      const num_nights = calculateNumberOfNights(check_in, check_out);

      const customerRequest = {
        num_rooms,
        num_adults,
        num_nights,
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
      let hotelCheckInTime: string = "00:00";
      let hotelCheckOutTime: string = "00:00";
      let hotelSurChargeRates: { [key: string]: any } = {};

      hotelPolicies.forEach((policy) => {
        if (policy.type === "TAX") {
          hotelTax = Number(policy.value);
        } else if (policy.type === "SERVICE_FEE") {
          hotelServiceFee = Number(policy.value);
        } else if (policy.type === "SURCHARGE_RATES") {
          hotelSurChargeRates = JSON.parse(policy.value);
        } else if (policy.type === "CHECK_IN_TIME") {
          hotelCheckInTime = policy.value;
        } else if (policy.type === "CHECK_OUT_TIME") {
          hotelCheckOutTime = policy.value;
        }
      });

      const cost = calculateCost(customerRequest, {
        ...hotelPolicy,
        surcharge_rates: hotelSurChargeRates,
        service_fee: hotelServiceFee,
        tax: hotelTax,
      });

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

      const availableRooms = await Room.findAll({
        where: {
          room_type_id,
          status: ROOM_STATUS.AVAILABLE,
        },
        order: [["number", "ASC"]],
      });

      if (availableRooms.length < num_rooms) {
        return res.status(400).json({
          status: 400,
          message: "Not enough available rooms for the specified room type!",
        });
      }

      const newBooking = await Booking.create({
        code: bookingCode,
        customer_id,
        check_in: new Date(`${check_in} ${hotelCheckInTime}:00`),
        check_out: new Date(`${check_out} ${hotelCheckOutTime}:00`),
        total_room_price: cost.total_room_price,
        tax_and_fee: cost.total_service_fee + cost.total_tax,
        status: BOOKING_STATUS.PENDING,
        expires_at: expiresAt,
        note,
      });

      const selectedRooms = availableRooms.slice(0, num_rooms);

      await Promise.all(
        selectedRooms.map(async (room, index) => {
          const roomData = cost.rooms[index];
          const roomBooking = await RoomBooking.create({
            room_id: room.id,
            booking_id: newBooking.id,
            num_adults: roomData.adults,
            num_children: roomData.children.length,
            children_ages: roomData.children,
            base_price: cost.base_price,
            surcharge: roomData.surcharges,
            discount: cost.room_discount,
            status: ROOM_STATUS.UNAVAILABLE,
          });

          room.status = ROOM_STATUS.UNAVAILABLE;
          await room.save();

          return roomBooking;
        })
      );

      let hotelImages = [];
      if (hotel.hotelImages && hotel.hotelImages.length > 0) {
        hotelImages = await Promise.all(
          hotel.hotelImages.map(async (image) => {
            try {
              const presignedUrl = await new Promise<string>(
                (resolve, reject) => {
                  minioConfig
                    .getClient()
                    .presignedGetObject(
                      DEFAULT_MINIO.BUCKET,
                      `${DEFAULT_MINIO.HOTEL_PATH}/${hotel.id}/${image.url}`,
                      24 * 60 * 60,
                      (err, presignedUrl) => {
                        if (err) reject(err);
                        else resolve(presignedUrl);
                      }
                    );
                }
              );

              return {
                ...image.toJSON(),
                url: presignedUrl,
              };
            } catch (error) {
              console.error("Error generating presigned URL:", error);
              return null;
            }
          })
        );
      }

      let roomTypeImages = [];
      if (roomType.roomImages && roomType.roomImages.length > 0) {
        roomTypeImages = await Promise.all(
          roomType.roomImages.map(async (image) => {
            try {
              const presignedUrl = await new Promise<string>(
                (resolve, reject) => {
                  minioConfig
                    .getClient()
                    .presignedGetObject(
                      DEFAULT_MINIO.BUCKET,
                      `${DEFAULT_MINIO.HOTEL_PATH}/${hotel.id}/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${roomType.id}/${image.url}`,
                      24 * 60 * 60,
                      (err, presignedUrl) => {
                        if (err) reject(err);
                        else resolve(presignedUrl);
                      }
                    );
                }
              );

              return {
                ...image.toJSON(),
                url: presignedUrl,
              };
            } catch (error) {
              console.error("Error generating presigned URL:", error);
              return null;
            }
          })
        );
      }

      const { total_room_price, total_service_fee, total_tax, final_price } =
        cost;

      return res.status(200).json({
        status: 201,
        message: "Booking created successfully!",
        data: {
          ...newBooking.toJSON(),
          code: bookingCode,
          hotel: {
            ...hotel.toJSON(),
            hotelImages,
            roomTypes: { ...roomType.toJSON(), roomImages: roomTypeImages },
            address: `${hotel.street}, ${hotel.ward}, ${hotel.district}, ${hotel.province}`,
            check_in_time: hotelCheckInTime,
            check_out_time: hotelCheckOutTime,
          },
          cost,
          customer,
          num_adults,
          num_children,
          num_rooms,
          total_service_fee,
          total_tax,
          final_price,
          room_bookings: selectedRooms.map((room, index) => ({
            room_id: room.id,
            num_adults: cost.rooms[index].adults,
            num_children: cost.rooms[index].children.length,
            children_ages: cost.rooms[index].children,
            base_price: cost.base_price,
            surcharge: cost.rooms[index].surcharges,
            discount: cost.room_discount,
          })),
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllBookingsByCustomerId(req: Request, res: Response) {
    try {
      const { customer_id } = req.params;
      const {
        sortOption = "NEWEST",
        page = PAGINATION.INITIAL_PAGE,
        size = PAGINATION.PAGE_SIZE,
      } = req.body;

      const orderOption = sortOptionMap[sortOption as SortOption] as OrderItem;
      const offset = (page - 1) * size;

      let whereCondition: any = { customer_id };

      if (sortOption === "CANCELLED") {
        whereCondition.status = { [Op.in]: ["CANCELLED", "FAILED"] };
      } else if (sortOption === "CONFIRMED") {
        whereCondition.status = {
          [Op.in]: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"],
        };
      } else if (sortOption === "CHECKED_IN") {
        whereCondition.status = "CHECKED_IN";
      } else if (sortOption === "CHECKED_OUT") {
        whereCondition.status = "CHECKED_OUT";
      }

      const totalBookings = await Booking.count({
        where: { customer_id },
        distinct: true,
      });

      const bookings = await Booking.findAll({
        where: whereCondition,
        order: [orderOption],
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                    include: [
                      { model: Hotel, include: [{ model: HotelImage }] },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: Customer,
          },
        ],
        limit: size,
        offset: offset,
      });

      const presignedUrls = await Promise.all(
        bookings.map(async (booking) => {
          const updatedRoomBookings = await Promise.all(
            booking.roomBookings.map(async (roomBooking) => {
              const updatedRoom = {
                ...roomBooking.room.toJSON(),
                roomType: {
                  ...roomBooking.room.roomType.toJSON(),
                  hotel: {
                    ...roomBooking.room.roomType.hotel.toJSON(),
                    hotelImages: await Promise.all(
                      roomBooking.room.roomType.hotel.hotelImages.map(
                        async (image) => {
                          const presignedUrl = await new Promise<string>(
                            (resolve, reject) => {
                              minioConfig
                                .getClient()
                                .presignedGetObject(
                                  DEFAULT_MINIO.BUCKET,
                                  `${DEFAULT_MINIO.HOTEL_PATH}/${roomBooking.room.roomType.hotel.id}/${image.url}`,
                                  24 * 60 * 60,
                                  (err, presignedUrl) => {
                                    if (err) reject(err);
                                    else resolve(presignedUrl);
                                  }
                                );
                            }
                          );

                          return {
                            ...image.toJSON(),
                            url: presignedUrl,
                          };
                        }
                      )
                    ),
                  },
                },
              };

              return {
                ...roomBooking.toJSON(),
                room: updatedRoom,
              };
            })
          );

          return {
            ...booking.toJSON(),
            roomBookings: updatedRoomBookings,
            translateStatus: translate("bookingStatus", booking.status),
            totalAdults: booking.roomBookings.reduce(
              (sum, roomBooking) => sum + roomBooking.num_adults,
              0
            ),
            totalChildren: booking.roomBookings.reduce(
              (sum, roomBooking) => sum + roomBooking.num_children,
              0
            ),
            totalPrice: booking.total_room_price + booking.tax_and_fee,
          };
        })
      );

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all booking data!",
        totalBookings,
        data: presignedUrls,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllBookingsByHotelId(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;
      const { page = PAGINATION.INITIAL_PAGE, size = PAGINATION.PAGE_SIZE } =
        req.query;
      const offset = (Number(page) - 1) * Number(size);

      const totalBookings = await Booking.findAll({
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                  },
                ],
              },
            ],
          },
        ],
      });

      const count = totalBookings.filter(
        (booking) =>
          String(booking.roomBookings[0].room.roomType.hotel_id) ===
          String(hotel_id)
      ).length;

      const bookings = await Booking.findAll({
        order: [["check_in", "desc"]],
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                    include: [{ model: RoomImage }],
                  },
                ],
              },
            ],
          },
          {
            model: Customer,
          },
        ],
        limit: Number(size),
        offset: offset,
      });

      const validBookings = bookings.filter(
        (booking) =>
          String(booking.roomBookings[0].room.roomType.hotel_id) ===
          String(hotel_id)
      );

      const presignedUrls = await Promise.all(
        validBookings.map(async (booking) => {
          const roomTypesMap: { [key: string]: any } = {};

          const updatedRoomBookings = await Promise.all(
            booking.roomBookings.map(async (roomBooking) => {
              if (!roomBooking.room || !roomBooking.room.roomType) {
                console.warn("Null room or roomType:", roomBooking);
                return roomBooking.toJSON();
              }

              const roomType = roomBooking.room.roomType;

              if (!roomTypesMap[roomType.id]) {
                const roomImages = await Promise.all(
                  (roomType.roomImages || []).map(async (image) => {
                    const presignedUrl = await new Promise<string>(
                      (resolve, reject) => {
                        minioConfig
                          .getClient()
                          .presignedGetObject(
                            DEFAULT_MINIO.BUCKET,
                            `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${roomType.id}/${image.url}`,
                            24 * 60 * 60,
                            (err, presignedUrl) => {
                              if (err) reject(err);
                              else resolve(presignedUrl);
                            }
                          );
                      }
                    );

                    return {
                      ...image.toJSON(),
                      url: presignedUrl,
                    };
                  })
                );

                roomTypesMap[roomType.id] = {
                  ...roomType.toJSON(),
                  roomImages,
                };
              }

              return {
                ...roomBooking.toJSON(),
                room: {
                  ...roomBooking.room.toJSON(),
                  roomType: roomTypesMap[roomType.id],
                },
              };
            })
          );

          return {
            ...booking.toJSON(),
            roomBookings: updatedRoomBookings,
            translateStatus: translate("bookingStatus", booking.status),
            totalAdults: booking.roomBookings.reduce(
              (sum, roomBooking) => sum + roomBooking.num_adults,
              0
            ),
            totalChildren: booking.roomBookings.reduce(
              (sum, roomBooking) => sum + roomBooking.num_children,
              0
            ),
            totalPrice: booking.total_room_price + booking.tax_and_fee,
          };
        })
      );

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all booking data!",
        data: presignedUrls,
        totalBookings: count,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getBookingStats(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthCount = await new BookingRepo().countBookingsByMonth(
        currentYear,
        currentMonth
      );
      const previousMonthCount = await new BookingRepo().countBookingsByMonth(
        previousYear,
        previousMonth
      );

      let percentageChange: number | null = null;
      if (previousMonthCount !== 0) {
        percentageChange =
          ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      } else if (currentMonthCount > 0) {
        percentageChange = 100;
      }

      if (percentageChange !== null) {
        percentageChange = parseFloat(percentageChange.toFixed(2));
      }

      const totalBookings = await Booking.count({
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
        },
        distinct: true,
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched customer statistics!",
        data: { totalBookings, currentMonthCount, percentageChange },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  /**
   * Tính tổng doanh thu từ tất cả các đặt phòng.
   *
   * @returns {Promise<number>} - Tổng doanh thu
   */
  async getTotalBookingRevenue(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const totalRoomPrice = await Booking.sum("total_room_price", {
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
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
        },
      });

      const totalRevenue = (totalRoomPrice || 0) + (totalTaxAndFee || 0);

      const currentMonthCount = await Booking.count({
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
          created_at: {
            [Op.gte]: new Date(currentYear, currentMonth, 1),
            [Op.lt]: new Date(currentYear, currentMonth + 1, 1),
          },
        },
        distinct: true,
      });

      const previousMonthCount = await Booking.count({
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
          created_at: {
            [Op.gte]: new Date(previousYear, previousMonth, 1),
            [Op.lt]: new Date(previousYear, previousMonth + 1, 1),
          },
        },
        distinct: true,
      });

      let percentageChange: number | null = null;
      if (previousMonthCount !== 0) {
        percentageChange =
          ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      } else if (currentMonthCount > 0) {
        percentageChange = 100;
      }

      if (percentageChange !== null) {
        percentageChange = parseFloat(percentageChange.toFixed(2));
      }

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched booking revenue statistics!",
        data: { totalRevenue, currentMonthCount, percentageChange },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getTotalBookingRevenueByHotelId(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const bookings = await Booking.findAll({
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
          created_at: {
            [Op.gte]: new Date(currentYear, currentMonth, 1),
            [Op.lt]: new Date(currentYear, currentMonth + 1, 1),
          },
        },
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                  },
                ],
              },
            ],
          },
        ],
      });

      const validBookings = bookings.filter(
        (booking) =>
          String(booking.roomBookings[0].room.roomType.hotel_id) ===
          String(hotel_id)
      );

      const totalRevenue = validBookings.reduce((acc, booking) => {
        const roomPrice = booking.total_room_price || 0;
        const taxAndFee = booking.tax_and_fee || 0;
        return acc + roomPrice + taxAndFee;
      }, 0);

      const currentMonthCount = await Booking.count({
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
          created_at: {
            [Op.gte]: new Date(currentYear, currentMonth, 1),
            [Op.lt]: new Date(currentYear, currentMonth + 1, 1),
          },
          "$roomBookings.room.roomType.hotel_id$": hotel_id,
        },
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                    where: {
                      hotel_id: hotel_id,
                    },
                  },
                ],
              },
            ],
          },
        ],
        distinct: true,
      });

      const previousMonthCount = await Booking.count({
        where: {
          status: {
            [Op.in]: [
              BOOKING_STATUS.CONFIRMED,
              BOOKING_STATUS.CHECKED_IN,
              BOOKING_STATUS.CHECKED_OUT,
            ],
          },
          created_at: {
            [Op.gte]: new Date(previousYear, previousMonth, 1),
            [Op.lt]: new Date(previousYear, previousMonth + 1, 1),
          },
          "$roomBookings.room.roomType.hotel_id$": hotel_id,
        },
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                    where: {
                      hotel_id: hotel_id,
                    },
                  },
                ],
              },
            ],
          },
        ],
        distinct: true,
      });

      let percentageChange: number | null = null;
      if (previousMonthCount !== 0) {
        percentageChange =
          ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      } else if (currentMonthCount > 0) {
        percentageChange = 100;
      }

      if (percentageChange !== null) {
        percentageChange = parseFloat(percentageChange.toFixed(2));
      }

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched booking revenue statistics by hotel!",
        data: { totalRevenue, currentMonthCount, percentageChange },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getMonthlyBookingRevenue(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const previousYear = currentYear - 1;

      const calculateMonthlyRevenue = async (
        year: number,
        month: number
      ): Promise<number> => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1);

        const bookings = await Booking.findAll({
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

        return bookings.reduce((acc, booking) => {
          const roomPrice = booking.total_room_price || 0;
          const taxAndFee = booking.tax_and_fee || 0;
          return acc + roomPrice + taxAndFee;
        }, 0);
      };

      const currentYearRevenue = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          calculateMonthlyRevenue(currentYear, i)
        )
      );

      const previousYearRevenue = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          calculateMonthlyRevenue(previousYear, i)
        )
      );

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched monthly booking revenue!",
        data: [
          {
            name: "Năm nay",
            data: currentYearRevenue,
          },
          {
            name: "Năm ngoái",
            data: previousYearRevenue,
          },
        ],
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getMonthlyBookingRevenueByHotelId(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const previousYear = currentYear - 1;

      const calculateMonthlyRevenue = async (
        year: number,
        month: number
      ): Promise<number> => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1);

        const bookings = await Booking.findAll({
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
          include: [
            {
              model: RoomBooking,
              include: [
                {
                  model: Room,
                  include: [
                    {
                      model: RoomType,
                    },
                  ],
                },
              ],
            },
          ],
        });

        const validBookings = bookings.filter(
          (booking) =>
            String(booking.roomBookings[0].room.roomType.hotel_id) ===
            String(hotel_id)
        );

        return validBookings.reduce((acc, booking) => {
          const roomPrice = booking.total_room_price || 0;
          const taxAndFee = booking.tax_and_fee || 0;
          return acc + roomPrice + taxAndFee;
        }, 0);
      };

      const currentYearRevenue = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          calculateMonthlyRevenue(currentYear, i)
        )
      );

      const previousYearRevenue = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          calculateMonthlyRevenue(previousYear, i)
        )
      );

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched monthly booking revenue!",
        data: [
          {
            name: "Năm nay",
            data: currentYearRevenue,
          },
          {
            name: "Năm ngoái",
            data: previousYearRevenue,
          },
        ],
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateBooking(req: Request, res: Response) {
    try {
      const booking_id = parseInt(req.params["booking_id"]);
      const bookingToUpdate = await Booking.findByPk(booking_id);

      if (!bookingToUpdate) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy đơn đặt phòng!",
        });
      }

      const fieldsToUpdate = ["status", "note"];

      const updatedBookingData: Partial<Booking> = {};
      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) {
          (updatedBookingData as any)[field] = req.body[field];
        }
      });

      await Booking.update(updatedBookingData, { where: { id: booking_id } });

      return res.status(200).json({
        status: 200,
        message: "Successfully updated booking data!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new BookingController();
