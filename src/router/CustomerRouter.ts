import BaseRoutes from "./base/BaseRouter";
import CustomerController from "../controller/CustomerController";
import validate from "../helper/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schema/CustomerSchema";

class CustomerRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get("/getAllCustomers", CustomerController.getAllCustomers);
    this.router.get(
      "/:customer_id/getCustomerById",
      CustomerController.getCustomerById
    );
    this.router.post(
      "/createCustomer",
      validate(createCustomerSchema),
      CustomerController.createCustomer
    );
    this.router.post(
      "/register",
      // validate(createCustomerSchema),
      CustomerController.customerRegister
    );
    this.router.post(
      "/verify",
      CustomerController.verifyMail
    );
    this.router.patch(
      "/:customer_id/updateCustomer",
      validate(updateCustomerSchema),
      CustomerController.updateCustomer
    );
    this.router.delete(
      "/:customer_id/deleteCustomer",
      CustomerController.deleteCustomer
    );
  }
}

export default new CustomerRoutes().router;
