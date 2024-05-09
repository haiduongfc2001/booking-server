import BaseRoutes from "./base/BaseRouter";
import ServiceController from "../controller/ServiceController";
import validate from "../helper/validate";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../schema/ServiceSchema";
import { authFullRole } from "../middleware/AuthCustomer";

class ServiceRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllServices",
      authFullRole,
      ServiceController.getAllServices
    );
    this.router.get(
      "/:service_id/getServiceById",
      authFullRole,
      ServiceController.getServiceById
    );
    this.router.post(
      "/createService",
      authFullRole,
      validate(createServiceSchema),
      ServiceController.createService
    );
    this.router.patch(
      "/:service_id/updateService",
      authFullRole,
      validate(updateServiceSchema),
      ServiceController.updateService
    );
    this.router.delete(
      "/:service_id/deleteService",
      authFullRole,
      ServiceController.deleteService
    );
  }
}

export default new ServiceRoutes().router;
