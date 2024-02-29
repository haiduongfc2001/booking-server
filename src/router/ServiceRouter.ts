import BaseRoutes from "./base/BaseRouter";
import ServiceController from "../controller/ServiceController";
import validate from "../helper/validate";
import { createServiceSchema, updateServiceSchema } from "../schema/ServiceSchema";

class ServiceRoutes extends BaseRoutes {
    public routes(): void {
        this.router.post("/create", validate(createServiceSchema), ServiceController.create);
        this.router.patch(
            "/update/:id",
            validate(updateServiceSchema),
            ServiceController.update
        );
        this.router.delete("/delete/:id", ServiceController.delete);
        this.router.get("/getAll", ServiceController.findAll);
        this.router.get("/detail/:id", ServiceController.findById);
    }
}

export default new ServiceRoutes().router