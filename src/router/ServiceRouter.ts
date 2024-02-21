import BaseRoutes from "./base/BaseRouter";
import ServiceController from "../controller/ServiceController";
import validate from "../helper/validate";
import { createServiceSchema, updateServiceSchema } from "../schema/ServiceSchema";

class ServiceRoutes extends BaseRoutes {
    public routes(): void {
        this.router.post("", validate(createServiceSchema), ServiceController.create);
        this.router.patch(
            "/:id",
            validate(updateServiceSchema),
            ServiceController.update
        );
        this.router.delete("/:id", ServiceController.delete);
        this.router.get("", ServiceController.findAll);
        this.router.get("/:id", ServiceController.findById);
    }
}

export default new ServiceRoutes().router