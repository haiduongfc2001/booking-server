import BaseRoutes from "./base/BaseRouter";
import CustomerController from "../controller/CustomerController";
import validate from "../helper/validate";
import { createCustomerSchema, updateCustomerSchema } from "../schema/CustomerSchema";

class CustomerRoutes extends BaseRoutes {
    public routes(): void {
        this.router.post("", validate(createCustomerSchema), CustomerController.create);
        this.router.patch(
            "/:id",
            validate(updateCustomerSchema),
            CustomerController.update
        );
        this.router.delete("/:id", CustomerController.delete);
        this.router.get("", CustomerController.findAll);
        this.router.get("/:id", CustomerController.findById);
    }
}

export default new CustomerRoutes().router