import BaseRoutes from "./base/BaseRouter";
import CustomerController from "../controller/CustomerController";
import validate from "../helper/validate";
import { createCustomerSchema, updateCustomerSchema } from "../schema/CustomerSchema";


class CustomerRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/", CustomerController.getAllCustomers);
        this.router.get("/:id", CustomerController.getCustomerById);
        this.router.post(
            "/",
            validate(createCustomerSchema),
            CustomerController.createCustomer
        );
        this.router.patch(
            "/:id",
            validate(updateCustomerSchema),
            CustomerController.updateCustomer
        );
        this.router.delete("/:id", CustomerController.deleteCustomer);
    }
}

export default new CustomerRoutes().router;