import BaseRoutes from "./base/BaseRouter";
import validate from "../helper/validate";
import { authFullRole } from "../middleware/Auth.middleware";
import { BedController } from "../controller/BedController";

class BedRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllBeds",
      // authFullRole,
      BedController.getAllBeds
    );
    this.router.get(
      "/:bed_id/getBedById",
      // authFullRole,
      BedController.getBedById
    );
    this.router.post(
      "/createBed",
      // authFullRole,
      // validate(createBedSchema),
      BedController.createBed
    );
    this.router.patch(
      "/:bed_id/updateBed",
      // authFullRole,
      // validate(updateBedSchema),
      BedController.updateBed
    );
    this.router.delete(
      "/:bed_id/deleteBed",
      // authFullRole,
      BedController.deleteBed
    );
  }
}

export default new BedRoutes().router;
