import BaseRoutes from "./base/BaseRouter";
import ServiceController from "../controller/ServiceController";
import validate from "../helper/validate";
import { createServiceSchema, updateServiceSchema } from "../schema/ServiceSchema";

class ServiceRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/", ServiceController.getAllServices);
        this.router.get("/:id", ServiceController.getServiceById);
        this.router.post(
            "/",
            validate(createServiceSchema),
            ServiceController.createService
        );
        this.router.patch(
            "/:id",
            validate(updateServiceSchema),
            ServiceController.updateService
        );
        this.router.delete("/:id", ServiceController.deleteService);
    }
}

export default new ServiceRoutes().router