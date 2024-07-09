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
import { FavoriteHotel } from "../model/FavoriteHotel";
import { Sequelize } from "sequelize-typescript";
import { calculateMaxRoomDiscount } from "../utils/CalculateMaxRoomDiscount";

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
        message: "Xóa khách sạn thành công!",
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
              { model: RoomImage },
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
            const [minPrice, maxPrice] = filters?.price_range;
            if (effective_price < minPrice || effective_price > maxPrice) {
              return null; // Return null for filtered room types
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
                  } catch (error: any) {
                    console.error(
                      `Error generating presigned URL for image ${image.id}: ${error.message}`
                    );
                    return null; // Return null for failed presigned URL generation
                  }
                })
              );

              roomTypeImages = roomTypeImages.filter((image) => image !== null); // Filter out null presigned URLs
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
              rooms:
                availableRooms.length > 0
                  ? availableRooms
                      .map((room) => room.toJSON())
                      .sort((a, b) => a.id - b.id)
                  : [],
              roomTypeImages,
              beds,
            };
          }

          return null; // Return null for room types with insufficient available rooms
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
            roomBooking.room &&
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
            policies: hotel.policies
              .map((policy: any) => {
                if (typeof policy.toJSON === "function") {
                  return policy.toJSON();
                } else {
                  // Handle cases where policy is not a Sequelize model instance
                  return {
                    type: policy.type,
                    value: policy.value,
                    description: policy.description,
                  };
                }
              })
              .sort((a: any, b: any) => a.type.localeCompare(b.type)),
            address: `${street}, ${ward}, ${district}, ${province}`,
            min_room_price,
            original_room_price,
            hotelImages: hotelImages.filter((image) => image !== null),
            roomTypes: filteredRoomTypes,
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
      const hotels = await Hotel.findAll({
        include: [{ model: HotelImage }],
      });

      const hotelList = await Promise.all(
        hotels.map(async (hotel) => {
          let avatar = "";
          if (hotel.hotelImages && hotel.hotelImages.length > 0) {
            try {
              avatar = await getPresignedUrl(
                hotel.id,
                hotel.hotelImages[0].url
              );
            } catch (error) {
              console.error(
                `Error getting presigned URL for hotel ${hotel.id}:`,
                error
              );
            }
          }

          return {
            id: hotel.id,
            name: hotel.name,
            avatar,
          };
        })
      );

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
      const { customer_id } = req.query;

      // Fetch hotels with necessary associations
      const hotels = await Hotel.findAll({
        include: [
          {
            model: RoomType,
            required: true,
            include: [
              {
                model: Promotion,
                required: false,
                where: {
                  is_active: true,
                },
              },
            ],
          },
          { model: HotelImage, required: false },
        ],
        limit: 8,
        offset: 0,
      });

      // Fetch reviews for each hotel and calculate necessary details
      const hotelsWithDetails = await Promise.all(
        hotels.map(async (hotel) => {
          // Calculate average ratings
          const reviews = await Review.findAll({
            include: [
              {
                model: Booking,
                required: true,
                include: [
                  {
                    model: RoomBooking,
                    required: true,
                    include: [
                      {
                        model: Room,
                        required: true,
                        include: [
                          {
                            model: RoomType,
                            where: { hotel_id: hotel.id },
                            include: [{ model: Hotel, required: true }],
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
                roomBooking.room &&
                roomBooking.room.roomType &&
                roomBooking.room.roomType.hotel.id === hotel.id
            )
          );

          const averageRatings = calculateAverageRatings(reviewsByHotel);

          // Calculate total bookings count
          const totalBookings = await Booking.count({
            include: [
              {
                model: RoomBooking,
                required: true,
                include: [
                  {
                    model: Room,
                    required: true,
                    include: [
                      {
                        model: RoomType,
                        where: { hotel_id: hotel.id },
                        include: [{ model: Hotel, required: true }],
                      },
                    ],
                  },
                ],
              },
            ],
            distinct: true,
          });

          // Calculate maximum room discount
          const maxRoomDiscount = await calculateMaxRoomDiscount(
            hotel.roomTypes
          );

          // Find lowest discounted price and original price for each room type
          const roomTypesWithPrices = await Promise.all(
            hotel.roomTypes.map(async (roomType) => {
              // Find active promotions
              const activePromotions = await Promotion.findAll({
                where: {
                  room_type_id: roomType.id,
                  is_active: true,
                  [Op.and]: [
                    { start_date: { [Op.lte]: new Date() } },
                    { end_date: { [Op.gte]: new Date() } },
                  ],
                },
              });

              // Calculate lowest discounted price
              const basePrice = roomType.base_price;
              let lowestDiscountedPrice = basePrice;

              activePromotions.forEach((promotion) => {
                if (promotion.discount_type === "PERCENTAGE") {
                  const discountedPrice =
                    basePrice * (1 - promotion.discount_value / 100);
                  lowestDiscountedPrice = Math.min(
                    lowestDiscountedPrice,
                    discountedPrice
                  );
                } else if (promotion.discount_type === "FIXED_AMOUNT") {
                  const discountedPrice = basePrice - promotion.discount_value;
                  lowestDiscountedPrice = Math.min(
                    lowestDiscountedPrice,
                    discountedPrice
                  );
                }
              });

              return {
                ...roomType.toJSON(),
                lowestDiscountedPrice,
                originalPrice: basePrice,
              };
            })
          );

          // Find the room type with the lowest discounted price
          const minRoomType = roomTypesWithPrices.reduce((min, roomType) =>
            roomType.lowestDiscountedPrice < min.lowestDiscountedPrice
              ? roomType
              : min
          );

          return {
            hotel,
            averageRatings,
            totalBookings,
            maxRoomDiscount,
            totalReviews: reviewsByHotel.length,
            original_room_price: minRoomType.originalPrice,
            min_room_price: minRoomType.lowestDiscountedPrice,
          };
        })
      );

      // Fetch favorite hotels of the customer
      const favoriteHotelIds = new Set();
      if (customer_id) {
        const favoriteHotels = await FavoriteHotel.findAll({
          where: {
            customer_id,
            hotel_id: {
              [Op.in]: hotels.map((hotel) => hotel.id),
            },
          },
          attributes: ["hotel_id"],
        });

        favoriteHotels.forEach((favHotel) => {
          favoriteHotelIds.add(favHotel.hotel_id);
        });
      }

      // Fetch presigned URLs for hotel images
      const hotelImagesMap = await Promise.all(
        hotels.map(async (hotel) => {
          const images = await generatePresignedUrls(
            hotel.id,
            hotel.hotelImages
          );
          return { hotelId: hotel.id, images };
        })
      );

      const hotelImages = Object.fromEntries(
        hotelImagesMap.map((entry) => [entry.hotelId, entry.images])
      );

      // Bổ sung averageRatings và giá phòng vào hotelsWithImagesAndFavorites
      const hotelsWithImagesAndFavorites = hotelsWithDetails.map(
        (hotelDetail) => {
          const {
            hotel,
            averageRatings,
            totalBookings,
            maxRoomDiscount,
            totalReviews, // Thêm totalReviews vào đây
            original_room_price,
            min_room_price,
          } = hotelDetail;
          const is_favorite_hotel = favoriteHotelIds.has(hotel.id);

          return {
            id: hotel.id,
            name: hotel.name,
            street: hotel.street,
            ward: hotel.ward,
            district: hotel.district,
            province: hotel.province,
            description: hotel.description,
            contact: hotel.contact,
            hotelImages: hotelImages[hotel.id] || [],
            is_favorite_hotel,
            averageRatings,
            totalBookings,
            maxRoomDiscount,
            totalReviews, // Thêm totalReviews vào đây
            original_room_price,
            min_room_price,
          };
        }
      );

      // Sắp xếp lại hotelsWithImagesAndFavorites nếu cần thiết
      hotelsWithImagesAndFavorites.sort((a, b) => {
        // Sort by average ratings (descending)
        if (Number(b.averageRatings) - Number(a.averageRatings) !== 0) {
          return Number(b.averageRatings) - Number(a.averageRatings);
        }

        // Sort by total bookings (descending) if ratings are the same
        if (Number(b.totalBookings) - Number(a.totalBookings) !== 0) {
          return Number(b.totalBookings) - Number(a.totalBookings);
        }

        // Sort by max room discount (descending) if both are the same
        return b.maxRoomDiscount - a.maxRoomDiscount;
      });

      // Lọc và trả về các khách sạn đã được bổ sung averageRatings và giá phòng
      const filteredHotels = hotelsWithImagesAndFavorites.map(
        ({
          id,
          name,
          street,
          ward,
          district,
          province,
          description,
          contact,
          hotelImages,
          is_favorite_hotel,
          averageRatings,
          original_room_price,
          min_room_price,
          totalReviews,
        }) => ({
          id,
          name,
          street,
          ward,
          district,
          province,
          description,
          contact,
          hotelImages,
          is_favorite_hotel,
          averageRatings: averageRatings.overall,
          original_room_price,
          min_room_price,
          totalReviews,
        })
      );

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched hotel search results data!",
        data: filteredHotels,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(
        res,
        error instanceof Error ? error.message : "An unknown error occurred."
      );
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
        customer_id,
      } = req.body;

      const {
        sortOption = "RELEVANT",
        page = PAGINATION.INITIAL_PAGE,
        size = PAGINATION.PAGE_SIZE,
      } = req.query;

      const pageNum = Number(page) || PAGINATION.INITIAL_PAGE;
      const sizeNum = Number(size) || PAGINATION.PAGE_SIZE;

      const offset = (pageNum - 1) * sizeNum;

      const formattedCheckInDate = getDateOnly(check_in);
      const formattedCheckOutDate = getDateOnly(check_out);

      const today = new Date();
      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      if (formattedCheckInDate < todayDateOnly) {
        return res.status(400).json({ message: "Check-in date not valid!" });
      }

      const nextDayAfterCheckIn = new Date(formattedCheckInDate);
      nextDayAfterCheckIn.setDate(nextDayAfterCheckIn.getDate() + 1);

      if (formattedCheckOutDate < nextDayAfterCheckIn) {
        return res.status(400).json({ message: "Check-out date not valid!" });
      }

      console.log("Searching hotels...");

      const hotelsCriteria: any = {
        where: {
          province: { [Op.iLike]: `%${location}%` },
          district: {
            [Op.iLike]: `%${filters?.district_name || ""}%`,
          },
        },
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
        limit: sizeNum,
        offset: offset,
      };

      if (filters?.hotel_amenities?.length > 0) {
        hotelsCriteria.include.push({
          model: HotelAmenity,
          required: true,
          where: {
            amenity: {
              [Op.in]: filters.hotel_amenities,
            },
          },
        });
      }

      // Tính toán tổng số khách sạn thỏa mãn điều kiện
      const total = await Hotel.count({
        where: hotelsCriteria.where,
        distinct: true,
        include: hotelsCriteria.include,
      });

      // Lấy danh sách khách sạn theo các tiêu chí
      const hotels = await Hotel.findAll(hotelsCriteria);

      const availableHotels = await Promise.all(
        hotels.map(async (hotel: any) => {
          let min_room_price = Infinity;
          let original_room_price = 0;

          const availableRoomTypes = await Promise.all(
            hotel.roomTypes.map(async (roomType: any) => {
              const room_discount = await calculateRoomDiscount(roomType);
              const effective_price = roomType.base_price - room_discount;

              if (filters?.price_range?.length === 2) {
                const [minPrice, maxPrice] = filters?.price_range;
                if (effective_price < minPrice || effective_price > maxPrice) {
                  return null;
                }
              }

              const availableRooms = roomType.rooms.filter(
                (room: any) =>
                  !room.roomBookings.some((roomBooking: any) => {
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
                    .map((room: any) => room.toJSON())
                    .sort((a: any, b: any) => a.id - b.id),
                  effective_price,
                };
              }

              return null;
            })
          );

          const filteredRoomTypes = availableRoomTypes.filter(
            (roomType) => roomType !== null
          );
          filteredRoomTypes.sort(
            (a, b) => a.effective_price - b.effective_price
          );

          if (filteredRoomTypes.length > 0) {
            const hotelImages = await Promise.all(
              hotel.hotelImages.map(async (image: any) => {
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

                return { ...image.toJSON(), url: presignedUrl };
              })
            );

            const reviews = await Review.findAll({
              include: [
                {
                  model: Booking,
                  required: true,
                  include: [
                    {
                      model: RoomBooking,
                      required: true,
                      include: [
                        {
                          model: Room,
                          required: true,
                          include: [
                            {
                              model: RoomType,
                              where: { hotel_id: hotel.id },
                              include: [{ model: Hotel, required: true }],
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
                  roomBooking.room &&
                  roomBooking.room.roomType &&
                  roomBooking.room.roomType.hotel.id === hotel.id
              )
            );

            const averageRatings =
              calculateAverageRatings(reviewsByHotel).overall;

            let is_favorite_hotel = false;

            if (customer_id) {
              const isFavoriteHotel = await FavoriteHotel.findOne({
                where: { customer_id, hotel_id: hotel.id },
              });
              if (isFavoriteHotel) {
                is_favorite_hotel = true;
              }
            }

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
              is_favorite_hotel,
              totalReviews: reviewsByHotel.length,
              averageRatings,
            };
          }

          return null;
        })
      );

      let filteredHotels = availableHotels.filter((hotel) => hotel !== null);

      if (filters.min_rating) {
        filteredHotels = filteredHotels.filter(
          (hotel) =>
            hotel !== null && hotel.averageRatings >= filters.min_rating
        );
      }

      switch (sortOption) {
        case "CHEAPEST":
          filteredHotels.sort(
            (a: any, b: any) => a.min_room_price - b.min_room_price
          );
          break;
        case "MOST_EXPENSIVE":
          filteredHotels.sort(
            (a: any, b: any) => b.min_room_price - a.min_room_price
          );
          break;
        case "STAR_RATING":
          filteredHotels.sort(
            (a: any, b: any) => b.averageRatings - a.averageRatings
          );
          break;
        case "HIGHEST_RATED":
          filteredHotels.sort(
            (a: any, b: any) =>
              b.averageRatings * b.totalReviews -
              a.averageRatings * a.totalReviews
          );
          break;
        default:
          break;
      }

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched hotel search results data!",
        data: {
          total,
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
        percentageChange = 100;
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

  async getAllAvailableRoomTypesByHotelId(req: Request, res: Response) {
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
              { model: RoomImage },
              { model: Bed },
              { model: RoomTypeAmenity },
            ],
          },
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
            const [minPrice, maxPrice] = filters?.price_range;
            if (effective_price < minPrice || effective_price > maxPrice) {
              return null; // Return null for filtered room types
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
                  } catch (error: any) {
                    console.error(
                      `Error generating presigned URL for image ${image.id}: ${error.message}`
                    );
                    return null; // Return null for failed presigned URL generation
                  }
                })
              );

              roomTypeImages = roomTypeImages.filter((image) => image !== null); // Filter out null presigned URLs
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
              rooms:
                availableRooms.length > 0
                  ? availableRooms
                      .map((room) => room.toJSON())
                      .sort((a, b) => a.id - b.id)
                  : [],
              roomTypeImages,
              beds,
            };
          }

          return null; // Return null for room types with insufficient available rooms
        })
      );

      const filteredRoomTypes = availableRoomTypes.filter(
        (roomType) => roomType !== null
      );

      // Sort the filtered room types by effective_price from low to high
      filteredRoomTypes.sort((a, b) => a.effective_price - b.effective_price);

      if (filteredRoomTypes.length > 0) {
        return res.status(200).json({
          status: 200,
          data: {
            ...hotel.toJSON(),
            roomTypes: filteredRoomTypes,
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
}

export default new HotelController();
