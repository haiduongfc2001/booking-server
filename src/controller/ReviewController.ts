import { Request, Response } from "express";
import { Booking } from "../model/Booking";
import ErrorHandler from "../utils/ErrorHandler";
import { Review } from "../model/Review";

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
        booking.status !== "CHECKED_OUT" ||
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
}

export default new ReviewController();
