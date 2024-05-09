import BaseRoutes from "./base/BaseRouter";
import CustomerController from "../controller/CustomerController";
import validate from "../helper/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schema/CustomerSchema";
import { authFullRole } from "../middleware/AuthCustomer";

class CustomerRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllCustomers",
      authFullRole,
      CustomerController.getAllCustomers
    );
    this.router.get(
      "/:customer_id/getCustomerById",
      authFullRole,
      CustomerController.getCustomerById
    );
    this.router.post(
      "/createCustomer",
      authFullRole,
      validate(createCustomerSchema),
      CustomerController.createCustomer
    );
    this.router.post(
      "/register",
      authFullRole,
      // validate(createCustomerSchema),
      CustomerController.customerRegister
    );
    this.router.post("/verify", authFullRole, CustomerController.verifyMail);
    this.router.post("/login", authFullRole, CustomerController.customerLogin);
    this.router.patch(
      "/:customer_id/updateCustomer",
      authFullRole,
      validate(updateCustomerSchema),
      CustomerController.updateCustomer
    );
    this.router.delete(
      "/:customer_id/deleteCustomer",
      authFullRole,
      CustomerController.deleteCustomer
    );
  }
}

export default new CustomerRoutes().router;
