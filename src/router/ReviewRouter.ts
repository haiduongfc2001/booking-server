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
    this.router.put(
      "/updateReview/:id",
      authFullRole,
      ReviewController.updateReview
    );
    this.router.delete(
      "/deleteReview/:id",
      authFullRole,
      ReviewController.deleteReview
    );
  }
}

export default new ReviewRoutes().router;
