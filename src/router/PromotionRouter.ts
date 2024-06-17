import BaseRoutes from "./base/BaseRouter";
import PromotionController from "../controller/PromotionController";
import { authFullRole } from "../middleware/Auth.middleware";

class PromotionRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/promotion/checkStatus",
      authFullRole,
      PromotionController.checkStatus
    );
    this.router.get(
      "/:room_type_id/promotion/getAllPromotionsByRoomTypeId",
      authFullRole,
      PromotionController.getAllPromotionsByRoomTypeId
    );
    this.router.get(
      "/:room_type_id/promotion/:promotion_id/getPromotionById",
      authFullRole,
      PromotionController.getPromotionById
    );
    this.router.post(
      "/:room_type_id/promotion/createPromotion",
      authFullRole,
      PromotionController.createPromotion
    );
    this.router.post(
      "/:room_type_id/promotion/createMultiplePromotions",
      authFullRole,
      PromotionController.createMultiplePromotions
    );
    this.router.patch(
      "/:room_type_id/promotion/:promotion_id/updatePromotion",
      authFullRole,
      PromotionController.updatePromotion
    );
    this.router.delete(
      "/:room_type_id/promotion/:promotion_id/deletePromotion",
      authFullRole,
      PromotionController.deletePromotion
    );
  }
}

export default new PromotionRoutes().router;
