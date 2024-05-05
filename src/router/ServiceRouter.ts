import BaseRoutes from "./base/BaseRouter";
import ServiceController from "../controller/ServiceController";
import validate from "../helper/validate";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../schema/ServiceSchema";

class ServiceRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get("/getAllServices", ServiceController.getAllServices);
    this.router.get(
      "/:service_id/getServiceById",
      ServiceController.getServiceById
    );
    this.router.post(
      "/createService",
      validate(createServiceSchema),
      ServiceController.createService
    );
    this.router.patch(
      "/:service_id/updateService",
      validate(updateServiceSchema),
      ServiceController.updateService
    );
    this.router.delete(
      "/:service_id/deleteService",
      ServiceController.deleteService
    );
  }
}

export default new ServiceRoutes().router;
