import BaseRoutes from "./base/BaseRouter";
import CustomerController from "../controller/CustomerController";
import validate from "../helper/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schema/CustomerSchema";
import { authCustomer } from "../middleware/AuthCustomer";

class CustomerRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllCustomers",
      authCustomer,
      CustomerController.getAllCustomers
    );
    this.router.get(
      "/:customer_id/getCustomerById",
      authCustomer,
      CustomerController.getCustomerById
    );
    this.router.post(
      "/createCustomer",
      authCustomer,
      validate(createCustomerSchema),
      CustomerController.createCustomer
    );
    this.router.post(
      "/register",
      // validate(createCustomerSchema),
      CustomerController.customerRegister
    );
    this.router.post("/verify", CustomerController.verifyMail);
    this.router.post("/login", CustomerController.customerLogin);
    this.router.patch(
      "/:customer_id/updateCustomer",
      authCustomer,
      validate(updateCustomerSchema),
      CustomerController.updateCustomer
    );
    this.router.delete(
      "/:customer_id/deleteCustomer",
      authCustomer,
      CustomerController.deleteCustomer
    );
  }
}

export default new CustomerRoutes().router;
