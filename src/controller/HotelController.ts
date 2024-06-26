import { Request, Response } from "express";
import { Hotel } from "../model/Hotel";
import { HotelRepo } from "../repository/HotelRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { StaffRepo } from "../repository/StaffRepo";
import { HotelImage } from "../model/HotelImage";
import { dbConfig } from "../config/database.config";
import { Op, QueryTypes } from "sequelize";
import { DEFAULT_MINIO, PAGINATION } from "../config/constant.config";
import { minioConfig } from "../config/minio.config";
import { Room } from "../model/Room";
import { Booking } from "../model/Booking";
import { RoomBooking } from "../model/RoomBooking";
import { RoomType } from "../model/RoomType";
import { calculateRoomDiscount } from "../utils/CalculateRoomDiscount";
import { Promotion } from "../model/Promotion";
import { getDateOnly } from "../utils/DateConversion";
import calculateCost from "../utils/CalculateCost";
import { Policy } from "../model/Policy";
import { RoomImage } from "../model/RoomImage";
import { Bed } from "../model/Bed";
import calculateNumberOfNights from "../utils/CalculateNumNights";
import { RoomTypeAmenity } from "../model/RoomTypeAmenity";
import { HotelAmenity } from "../model/HotelAmenity";
import { Review } from "../model/Review";
import { calculateAverageRatings } from "../utils/CalculateRating";

export const extractPolicies = (policies: Policy[]) => {
  let tax = 0;
  let service_fee = 0;
  let surcharge_rates: { [key: string]: any } = {};

  policies.forEach((policy) => {
    if (policy.type === "TAX") {
      tax = Number(policy.value);
    } else if (policy.type === "SERVICE_FEE") {
      service_fee = Number(policy.value);
    } else if (policy.type === "SURCHARGE_RATES") {
      surcharge_rates = JSON.parse(policy.value);
    }
  });

  return { tax, service_fee, surcharge_rates };
};

export const getPresignedUrl = (
  hotelId: number,
  imagePath: string
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    minioConfig
      .getClient()
      .presignedGetObject(
        DEFAULT_MINIO.BUCKET,
        `${DEFAULT_MINIO.HOTEL_PATH}/${hotelId}/${imagePath}`,
        24 * 60 * 60,
        (err, presignedUrl) => {
          if (err) reject(err);
          else resolve(presignedUrl);
        }
      );
  });
};

export const generatePresignedUrls = async (
  hotelId: number,
  images: any[]
): Promise<any[]> => {
  return Promise.all(
    images.map(async (image) => {
      try {
        const presignedUrl = await getPresignedUrl(hotelId, image.url);
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
};

class HotelController {
  async createHotel(req: Request, res: Response) {
    try {
      const {
        name,
        street,
        ward,
        district,
        province,
        // latitude,
        // longitude,
        description,
        contact,
      } = req.body;

      const newHotel = new Hotel({
        name,
        street,
        ward,
        district,
        province,
        // latitude,
        // longitude,
        description,
        contact,
      });

      await new HotelRepo().save(newHotel);

      res.status(201).json({
        status: 201,
        message: "Successfully created hotel!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteHotel(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params["hotel_id"]);

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      await new HotelRepo().delete(hotel_id);

      return res.status(200).json({
        status: 200,
        message: "Successfully deleted hotel!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelById(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params?.hotel_id);

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const hotelInfo = await new HotelRepo().retrieveById(hotel_id);

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched hotel by id ${hotel_id}!`,
        data: hotelInfo,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelDetail(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params?.hotel_id);
      const {
        check_in,
        check_out,
        num_adults,
        num_children,
        num_rooms,
        children_ages = [],
        filters,
      } = req.body;

      const hotel = await Hotel.findByPk(hotel_id, {
        include: [
          {
            model: RoomType,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomBooking,
                    include: [{ model: Booking }],
                  },
                ],
              },
              { model: Bed },
              { model: RoomTypeAmenity },
            ],
          },
          { model: HotelAmenity },
          { model: HotelImage },
          { model: Policy },
        ],
      });

      if (!hotel) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const { tax, service_fee, surcharge_rates } = extractPolicies(
        hotel.policies
      );

      const num_nights = calculateNumberOfNights(check_in, check_out);
      const customerRequest = {
        num_rooms,
        num_nights,
        num_adults,
        num_children,
        children_ages,
      };
      const formattedCheckInDate = getDateOnly(check_in);
      const formattedCheckOutDate = getDateOnly(check_out);

      let min_room_price = Infinity;
      let original_room_price = 0;

      const availableRoomTypes = await Promise.all(
        hotel.roomTypes.map(async (roomType) => {
          const room_discount = await calculateRoomDiscount(roomType);
          const effective_price = roomType.base_price - room_discount;

          const {
            base_price,
            standard_occupant,
            max_children,
            max_occupant,
            max_extra_bed,
          } = roomType;

          if (filters?.price_range?.length === 2) {
            const [minPrice, maxPrice] = filters.price_range;
            if (effective_price < minPrice || effective_price > maxPrice) {
              return null;
            }
          }

          const availableRooms = roomType.rooms.filter(
            (room) =>
              !room.roomBookings.some((roomBooking) => {
                const checkIn = new Date(roomBooking.booking.check_in);
                const checkOut = new Date(roomBooking.booking.check_out);
                return (
                  checkIn <= formattedCheckOutDate &&
                  checkOut >= formattedCheckInDate
                );
              })
          );

          if (availableRooms.length >= num_rooms) {
            if (effective_price < min_room_price) {
              min_room_price = effective_price;
              original_room_price = roomType.base_price;
            }

            let roomTypeImages = [];
            if (roomType.roomImages && roomType.roomImages.length > 0) {
              roomTypeImages = await generatePresignedUrls(
                hotel.id,
                roomType.roomImages
              );
            }

            const hotelPolicy = {
              base_price,
              room_discount,
              standard_occupant,
              max_children,
              max_occupant,
              max_extra_bed,
              surcharge_rates,
              tax,
              service_fee,
            };
            const cost = calculateCost(customerRequest, hotelPolicy);

            const beds: any[] = roomType.beds;

            return {
              ...roomType.toJSON(),
              room_discount,
              num_rooms: availableRooms.length,
              effective_price,
              cost,
              rooms: availableRooms
                .map((room) => room.toJSON())
                .sort((a, b) => a.id - b.id),
              images: roomTypeImages,
              beds,
            };
          }

          return null;
        })
      );

      const filteredRoomTypes = availableRoomTypes.filter(
        (roomType) => roomType !== null
      );

      // Sort the filtered room types by effective_price from low to high
      filteredRoomTypes.sort((a, b) => a.effective_price - b.effective_price);

      const reviews = await Review.findAll({
        include: [
          {
            model: Booking,
            include: [
              {
                model: RoomBooking,
                include: [
                  {
                    model: Room,
                    include: [
                      {
                        model: RoomType,
                        where: { hotel_id },
                        include: [{ model: Hotel }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      const reviewsByHotel = reviews.filter((review) =>
        review.booking.roomBookings.some(
          (roomBooking) =>
            roomBooking.room && // Kiểm tra roomBooking.room có tồn tại không
            roomBooking.room.roomType &&
            roomBooking.room.roomType.hotel.id === Number(hotel_id)
        )
      );

      if (filteredRoomTypes.length > 0) {
        const hotelImages = await generatePresignedUrls(
          hotel.id,
          hotel.hotelImages
        );

        const averageRatings = calculateAverageRatings(reviewsByHotel);

        const { street, ward, district, province } = hotel;
        return res.status(200).json({
          status: 200,
          data: {
            ...hotel.toJSON(),
            address: `${street}, ${ward}, ${district}, ${province}`,
            min_room_price,
            original_room_price,
            images: hotelImages.filter((image) => image !== null),
            room_types: filteredRoomTypes,
            averageRatings,
            totalReviews: reviewsByHotel.length,
          },
        });
      }

      return res.status(200).json({
        status: 200,
        message: `No available room types for hotel id ${hotel_id}!`,
        data: [],
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getStaffsByHotelId(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params["hotel_id"]);

      const existingHotel = await Hotel.findByPk(hotel_id);

      if (!existingHotel) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const staffs = await new StaffRepo().retrieveAllStaffsByHotelId(hotel_id);

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched staff by hotel id ${hotel_id}!`,
        data: staffs,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllRoomTypesByHotelId(req: Request, res: Response) {
    const hotel_id = parseInt(req.params["hotel_id"]);

    const existingHotel = await Hotel.findByPk(hotel_id);

    if (!existingHotel) {
      return res.status(404).json({
        status: 404,
        message: "Không tìm thấy khách sạn!",
      });
    }

    try {
      const roomTypes = await RoomType.findAll({
        where: {
          hotel_id,
        },
        order: [["name", "asc"]],
        include: [{ model: RoomImage }, { model: Room }],
      });

      // Create presigned URLs for hotel images
      const updatedRoomTypes = await Promise.all(
        roomTypes.map(async (roomType) => {
          // Check if roomImages array is empty
          if (!roomType.roomImages || roomType.roomImages.length === 0) {
            return {
              ...roomType.toJSON(),
              totalRooms: 0,
              roomImages: [],
            };
          }

          // Check if rooms array is empty or undefined
          const totalRooms = roomType.rooms.length;

          const updatedImages = await Promise.all(
            roomType.roomImages.map(async (image) => {
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

          return {
            ...roomType.toJSON(),
            totalRooms,
            roomImages: updatedImages,
          };
        })
      );

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched room by hotel id ${hotel_id}!`,
        data: {
          totalRoomTypes: roomTypes.length,
          roomTypes: updatedRoomTypes,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllStaffsByHotelId(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);

      const hotelExists = await Hotel.findByPk(hotel_id);
      if (!hotelExists) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const staffs = await new StaffRepo().retrieveAllStaffsByHotelId(hotel_id);

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all staff data!",
        data: staffs,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllHotels(req: Request, res: Response) {
    try {
      const hotelsData = await new HotelRepo().retrieveAll();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all hotel data!",
        data: hotelsData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelList(req: Request, res: Response) {
    try {
      const hotels = await new HotelRepo().retrieveAll();

      const hotelList = hotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
      }));

      return res.status(200).json({
        status: 200,
        message: "Hotel list successfully retrieved!",
        data: hotelList,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateHotel(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params["hotel_id"]);
      const hotelToUpdate = await Hotel.findByPk(hotel_id);

      if (!hotelToUpdate) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const fieldsToUpdate = [
        "name",
        "street",
        "ward",
        "district",
        "province",
        // "latitude",
        // "longitude",
        "description",
        "contact",
      ];

      // Create an updated hotel object
      const updatedHotelData: Partial<Hotel> = {};
      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) {
          (updatedHotelData as any)[field] = req.body[field];
        }
      });

      await Hotel.update(updatedHotelData, { where: { id: hotel_id } });

      return res.status(200).json({
        status: 200,
        message: "Successfully updated hotel data!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getOutstandingHotels(req: Request, res: Response) {
    try {
      const sequelize = dbConfig.sequelize;

      if (sequelize) {
        const query = `
          SELECT
            h.id AS hotel_id,
            h.name AS hotel_name,
            h.province AS hotel_province,
            (
              SELECT hi.url
              FROM hotel_image hi
              WHERE hi.hotel_id = h.id
                AND hi.is_primary = true
              LIMIT 1 
            ) AS hotel_avatar,
            MIN(CASE
              WHEN p.discount_type = 'PERCENTAGE' THEN rt.base_price * (1 - p.discount_value / 100)
              WHEN p.discount_type = 'FIXED_AMOUNT' THEN rt.base_price - p.discount_value
              ELSE rt.base_price
            END) AS min_room_price,
            (
              SELECT rt.base_price
              FROM (
                SELECT
                  rt.base_price,
                  ROW_NUMBER() OVER (ORDER BY CASE
                    WHEN MIN(p.discount_type) = 'PERCENTAGE' THEN rt.base_price * (1 - p.discount_value / 100)
                    WHEN MIN(p.discount_type) = 'FIXED_AMOUNT' THEN rt.base_price - p.discount_value
                    ELSE rt.base_price
                  END) AS rn
                FROM room_type rt
                LEFT JOIN promotion p ON rt.id = p.room_type_id  
                WHERE rt.hotel_id = h.id  
                GROUP BY rt.base_price, rt.id, p.discount_value 
              ) r
              WHERE rt.rn = 1  
            ) AS original_room_price
          FROM
            hotel h
          JOIN
            room_type rt ON h.id = rt.hotel_id
          LEFT JOIN promotion p ON rt.id = p.room_type_id
          GROUP BY
            h.id, h.name, h.province, p.discount_value;
        `;

        const hotels = await sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        const updatedHotels = await Promise.all(
          hotels.map(async (hotel: any) => {
            // Generate presigned URL for hotel avatar
            const presignedUrl = await new Promise<string>(
              (resolve, reject) => {
                minioConfig
                  .getClient()
                  .presignedGetObject(
                    DEFAULT_MINIO.BUCKET,
                    `${DEFAULT_MINIO.HOTEL_PATH}/${hotel.hotel_id}/${hotel.hotel_avatar}`,
                    24 * 60 * 60,
                    function (err, presignedUrl) {
                      if (err) reject(err);
                      else resolve(presignedUrl);
                    }
                  );
              }
            );

            // Return updated hotel object with presigned URL
            return {
              ...hotel,
              hotel_avatar: presignedUrl,
            };
          })
        );

        return res.status(200).json({
          status: 200,
          message: "Successfully fetched outstanding hotel data!",
          data: updatedHotels,
        });
      }
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelSearchResults(req: Request, res: Response) {
    try {
      // const payload = {
      //   location: "Hà Nội",
      //   checkIn: "2022-05-06",
      //   checkOut: "2022-05-07",
      //   numRooms: 2,
      //   numAdults: 3,
      //   numChildren: 2,
      //   childrenAges: [7, 10],
      //   filters: {
      //     priceRange: [0, 4500000],
      //     selectedHotelAmenities: ["Bể bơi", "Bãi để xe"],
      //     selectedRoomAmenities: ["Điều hòa", Tivi],
      //     paymentOptions: ["Hủy miễn phí", "Thanh toán liền"],
      //     minRating: "8.0",
      //   },
      // };

      // Đầu tiền là phải xét đến việc tìm kiếm theo khu vực (location), ở đây là Hà Nội.
      // Sau khi tìm được những khách sạn ở Hà Nội rồi thì tìm trong các phòng của các khách sạn đó
      // xem trong khoảng thời gian checkInData và checkOut có những phòng nào có sẵn.
      // Tiếp theo, trong những phòng có sẵn trong khoảng thời gian đó thì sẽ xét xem những phòng
      // nào thỏa mãn số lượng người lớn, số lượng trẻ em.
      // Ví dụ khách hàng cần tìm kiếm với yêu cầu có 3 người lớn và 2 trẻ em

      const {
        location,
        check_in,
        check_out,
        num_rooms,
        num_adults,
        num_children,
        children_ages = [], // default to empty array if not provided
        filters,
        //   filters: {
        //     priceRange: [0, 4500000],
        //     selectedHotelAmenities: ["Bể bơi", "Bãi để xe"],
        //     selectedRoomAmenities: ["Điều hòa", Tivi],
        //     paymentOptions: ["Hủy miễn phí", "Thanh toán liền"],
        //     minRating: "8.0",
        //   },
        page = PAGINATION.INITIAL_PAGE,
        size = PAGINATION.PAGE_SIZE,
      } = req.body;

      const offset = (page - 1) * size;

      const formattedCheckInDate = getDateOnly(check_in);
      const formattedCheckOutDate = getDateOnly(check_out);

      const today = new Date();
      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      // Ensure check-in date is not in the past
      if (formattedCheckInDate < todayDateOnly) {
        return res.status(400).json({
          message: "Check-in date not valid!",
        });
      }

      // Ensure check-out date is at least one day after check-in date
      const nextDayAfterCheckIn = new Date(formattedCheckInDate);
      nextDayAfterCheckIn.setDate(nextDayAfterCheckIn.getDate() + 1);

      if (formattedCheckOutDate < nextDayAfterCheckIn) {
        return res.status(400).json({
          message: "Check-out date not valid!",
        });
      }

      console.log("Searching hotels...");

      const hotels = await Hotel.findAll({
        where: { province: { [Op.iLike]: `%${location}%` } },
        include: [
          {
            model: RoomType,
            required: true,
            where: {
              standard_occupant: { [Op.gte]: num_adults },
              max_children: { [Op.gte]: num_children },
            },
            include: [
              {
                model: Room,
                required: true,
                include: [
                  {
                    model: RoomBooking,
                    required: false,
                    include: [
                      {
                        model: Booking,
                        where: {
                          [Op.or]: [
                            {
                              check_in: {
                                [Op.between]: [
                                  formattedCheckInDate,
                                  formattedCheckOutDate,
                                ],
                              },
                            },
                            {
                              check_out: {
                                [Op.between]: [
                                  formattedCheckInDate,
                                  formattedCheckOutDate,
                                ],
                              },
                            },
                            {
                              [Op.and]: [
                                {
                                  check_in: { [Op.lte]: formattedCheckInDate },
                                },
                                {
                                  check_out: {
                                    [Op.gte]: formattedCheckOutDate,
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              {
                model: Promotion,
                required: false,
                where: {
                  is_active: true,
                  [Op.and]: [
                    { start_date: { [Op.lte]: formattedCheckInDate } },
                    { end_date: { [Op.gte]: formattedCheckOutDate } },
                  ],
                },
              },
            ],
          },
          { model: HotelImage, required: true },
        ],
        limit: size,
        offset: offset,
      });

      console.log("Hotels found:", hotels.length);

      const availableHotels = await Promise.all(
        hotels.map(async (hotel) => {
          let min_room_price = Infinity;
          let original_room_price = 0;

          const availableRoomTypes = await Promise.all(
            hotel.roomTypes.map(async (roomType) => {
              const room_discount = await calculateRoomDiscount(roomType);
              const effective_price = roomType.base_price - room_discount;

              if (filters?.price_range?.length === 2) {
                const [minPrice, maxPrice] = filters.price_range;
                if (effective_price < minPrice || effective_price > maxPrice) {
                  return null;
                }
              }

              const availableRooms = roomType.rooms.filter(
                (room) =>
                  !room.roomBookings.some((roomBooking) => {
                    const checkIn = new Date(roomBooking.booking.check_in);
                    const checkOut = new Date(roomBooking.booking.check_out);
                    return (
                      checkIn <= formattedCheckOutDate &&
                      checkOut >= formattedCheckInDate
                    );
                  })
              );

              if (availableRooms.length >= num_rooms) {
                if (effective_price < min_room_price) {
                  min_room_price = effective_price;
                  original_room_price = roomType.base_price;
                }
                return {
                  ...roomType.toJSON(),
                  room_discount,
                  num_rooms: availableRooms.length,
                  rooms: availableRooms
                    .map((room) => room.toJSON())
                    .sort((a, b) => a.id - b.id),
                  effective_price,
                };
              }

              return null;
            })
          );

          const filteredRoomTypes = availableRoomTypes.filter(
            (roomType) => roomType !== null
          );

          // Sort the filtered room types by effective_price from low to high
          filteredRoomTypes.sort(
            (a, b) => a.effective_price - b.effective_price
          );

          if (filteredRoomTypes.length > 0) {
            const hotelImages = await Promise.all(
              hotel.hotelImages.map(async (image) => {
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
              })
            );

            const { street, ward, district, province } = hotel;
            return {
              id: hotel.id,
              name: hotel.name,
              street,
              ward,
              district,
              province,
              address: `${street}, ${ward}, ${district}, ${province}`,
              description: hotel.description,
              min_room_price,
              original_room_price,
              images: hotelImages,
              room_types: filteredRoomTypes,
            };
          }

          return null;
        })
      );

      const filteredHotels = availableHotels.filter((hotel) => hotel !== null);

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched hotel search results data!",
        data: {
          total: filteredHotels.length,
          items: filteredHotels,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(
        res,
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    }
  }

  async getHotelStats(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthCount = await new HotelRepo().countHotelsByMonth(
        currentYear,
        currentMonth
      );
      const previousMonthCount = await new HotelRepo().countHotelsByMonth(
        previousYear,
        previousMonth
      );

      let percentageChange: number | null = null;
      if (previousMonthCount !== 0) {
        percentageChange =
          ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      } else if (currentMonthCount > 0) {
        percentageChange = 100; // If no hotels in previous month but there are in the current month, it's a 100% increase.
      }

      if (percentageChange !== null) {
        percentageChange = parseFloat(percentageChange.toFixed(2));
      }

      const totalCustomers = await Hotel.count();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched hotel statistics!",
        data: { totalCustomers, currentMonthCount, percentageChange },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getTotalHotels(req: Request, res: Response) {
    try {
      const totalHotels = await Hotel.count();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched total hotels!",
        data: totalHotels,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new HotelController();
