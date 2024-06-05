import { Request, Response } from "express";
import { Booking } from "../model/Booking";
import ErrorHandler from "../utils/ErrorHandler";
import { Review } from "../model/Review";
import { RoomBooking } from "../model/RoomBooking";
import { Room } from "../model/Room";
import { Hotel } from "../model/Hotel";
import { RoomType } from "../model/RoomType";
import { Payment } from "../model/Payment";
import { Customer } from "../model/Customer";
import { BOOKING_STATUS } from "../config/enum.config";
import { calculateAverageRatings } from "../utils/CalculateRating";
import { minioConfig } from "../config/minio.config";
import { DEFAULT_MINIO } from "../config/constant.config";

class ReviewController {
  async createReview(req: Request, res: Response) {
    try {
      const {
        booking_id,
        customer_id,
        location_rating,
        price_rating,
        service_rating,
        cleanliness_rating,
        amenities_rating,
        comment,
      } = req.body;

      const booking = await Booking.findByPk(booking_id);

      if (
        !booking ||
        booking.status !== BOOKING_STATUS.CHECKED_OUT ||
        booking.customer_id !== customer_id
      ) {
        return res.status(400).json({
          status: 400,
          message:
            "Review can only be created if the booking status is CHECKED_OUT and the customer_id matches the booking's customer_id",
        });
      }

      const review = await Review.create({
        booking_id,
        customer_id,
        location_rating,
        price_rating,
        service_rating,
        cleanliness_rating,
        amenities_rating,
        comment,
      });

      return res.status(201).json({
        status: 201,
        message: "Review created successfully!",
        data: review,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getReviews(req: Request, res: Response) {
    try {
      const reviews = await Review.findAll();
      return res.status(200).json({
        status: 200,
        data: reviews,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getReviewById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({
          status: 404,
          message: "Review not found!",
        });
      }
      return res.status(200).json({
        status: 200,
        data: review,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        location_rating,
        price_rating,
        service_rating,
        cleanliness_rating,
        amenities_rating,
        comment,
      } = req.body;

      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({
          status: 404,
          message: "Review not found!",
        });
      }

      // Update review properties if they are defined in the request body
      if (location_rating !== undefined) {
        review.location_rating = location_rating;
      }
      if (price_rating !== undefined) {
        review.price_rating = price_rating;
      }
      if (service_rating !== undefined) {
        review.service_rating = service_rating;
      }
      if (cleanliness_rating !== undefined) {
        review.cleanliness_rating = cleanliness_rating;
      }
      if (amenities_rating !== undefined) {
        review.amenities_rating = amenities_rating;
      }
      if (comment !== undefined) {
        review.comment = comment;
      }

      await review.save();

      return res.status(200).json({
        status: 200,
        message: "Review updated successfully!",
        data: review,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({
          status: 404,
          message: "Review not found!",
        });
      }
      await review.destroy();
      return res.status(200).json({
        status: 200,
        message: "Review deleted successfully!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getHotelReviews(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;

      // Fetch all reviews for the specified hotel
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

      if (!reviews || reviews.length === 0) {
        return res.status(200).json({
          status: 200,
          message: "No reviews yet!",
        });
      }

      const reviewsByHotel = reviews.filter((review) =>
        review.booking.roomBookings.some(
          (roomBooking) =>
            roomBooking.room && // Kiểm tra roomBooking.room có tồn tại không
            roomBooking.room.roomType &&
            roomBooking.room.roomType.hotel.id === Number(hotel_id)
        )
      );

      const reviewRatings = await Promise.all(
        reviewsByHotel.map(async (review) => {
          try {
            const customer = await Customer.findByPk(review.customer_id);

            let customerAvatar = "";
            if (customer && customer.avatar) {
              try {
                customerAvatar = await minioConfig
                  .getClient()
                  .presignedGetObject(
                    DEFAULT_MINIO.BUCKET,
                    `${DEFAULT_MINIO.CUSTOMER_PATH}/${customer.id}/${customer.avatar}`,
                    24 * 60 * 60
                  );
              } catch (avatarError) {
                console.error("Error fetching customer avatar:", avatarError);
              }
            }

            // Safely access nested properties
            const roomType =
              review.booking?.roomBookings?.[0]?.room?.roomType || {};

            const { booking_id, customer_id, ...reviewWithoutBookingId } =
              review.toJSON();

            return {
              ...reviewWithoutBookingId,
              averageRating:
                (review.location_rating +
                  review.price_rating +
                  review.service_rating +
                  review.cleanliness_rating +
                  review.amenities_rating) /
                5,
              customer: {
                full_name: customer?.full_name,
                email: customer?.email,
                avatar: customerAvatar,
              },
              roomType,
            };
          } catch (error) {
            console.error("Error processing review:", error);
            return null; // Optionally handle how to deal with failed reviews
          }
        })
      );

      // Filter out any null reviews if there were errors
      const filteredReviewRatings = reviewRatings.filter(
        (review) => review !== null
      );

      const averageRatings = calculateAverageRatings(reviewsByHotel);

      // Tính toán số lượng đánh giá theo mức độ rating
      const countByRatingLevel = {
        FANTASTIC: 0,
        VERY_GOOD: 0,
        SATISFYING: 0,
        AVERAGE: 0,
        POOR: 0,
      };

      reviewRatings.forEach((review) => {
        const averageRating = review.averageRating;
        if (averageRating >= 9) {
          countByRatingLevel.FANTASTIC++;
        } else if (averageRating >= 8) {
          countByRatingLevel.VERY_GOOD++;
        } else if (averageRating >= 7) {
          countByRatingLevel.SATISFYING++;
        } else if (averageRating >= 6) {
          countByRatingLevel.AVERAGE++;
        } else {
          countByRatingLevel.POOR++;
        }
      });

      return res.status(200).json({
        status: 200,
        data: {
          reviews: reviewRatings,
          averageRatings,
          totalReviews: reviewRatings.length,
          countByRatingLevel,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new ReviewController();
