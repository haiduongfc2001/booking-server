import BaseRoutes from "./base/BaseRouter";
import PromotionController from "../controller/PromotionController";
import { authFullRole } from "../middleware/Auth.middleware";

class PromotionRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/checkStatus",
      authFullRole,
      PromotionController.checkStatus
    );
  }
}

export default new PromotionRoutes().router;
