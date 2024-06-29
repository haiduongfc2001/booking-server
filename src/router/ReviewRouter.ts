import BaseRoutes from "./base/BaseRouter";
import { authFullRole } from "../middleware/Auth.middleware";
import ReviewController from "../controller/ReviewController";

class ReviewRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/createReview",
      authFullRole,
      ReviewController.createReview
    );
    this.router.get("/getReviews", authFullRole, ReviewController.getReviews);
    this.router.get(
      "/getReviewById/:id",
      authFullRole,
      ReviewController.getReviewById
    );
    this.router.patch(
      "/updateReview/:id",
      authFullRole,
      ReviewController.updateReview
    );
    this.router.delete(
      "/deleteReview/:id",
      authFullRole,
      ReviewController.deleteReview
    );
    this.router.get(
      "/getHotelReviews/:hotel_id",
      authFullRole,
      ReviewController.getHotelReviews
    );
    this.router.post(
      "/:review_id/createReplyReview",
      authFullRole,
      ReviewController.createReplyReview
    );
    this.router.patch(
      "/updateReplyReview/:reply_review_id",
      authFullRole,
      ReviewController.updateReplyReview
    );
    this.router.delete(
      "/deleteReplyReview/:reply_review_id",
      authFullRole,
      ReviewController.deleteReplyReview
    );
  }
}

export default new ReviewRoutes().router;
