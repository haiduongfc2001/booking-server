import BaseRoutes from "./base/BaseRouter";
import CustomerController from "../controller/CustomerController";
import validate from "../helper/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../schema/CustomerSchema";
import { authFullRole } from "../middleware/Auth.middleware";
import multer from "multer";

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
      // validate(createCustomerSchema),
      CustomerController.customerRegister
    );
    this.router.post("/verify", CustomerController.verifyMail);
    this.router.post("/login", CustomerController.customerLogin);
    this.router.patch(
      "/:customer_id/updateCustomer",
      authFullRole,
      validate(updateCustomerSchema),
      upload.single("avatar"),
      CustomerController.updateCustomer
    );
    this.router.delete(
      "/:customer_id/deleteCustomer",
      authFullRole,
      CustomerController.deleteCustomer
    );
    this.router.post(
      "/:customer_id/getFavoriteHotelsByCustomerId",
      authFullRole,
      CustomerController.getFavoriteHotelsByCustomerId
    );
    this.router.post(
      "/addFavoriteHotel",
      authFullRole,
      CustomerController.addFavoriteHotel
    );
    this.router.post(
      "/removeFavoriteHotel",
      authFullRole,
      CustomerController.removeFavoriteHotel
    );
    this.router.get(
      "/getCustomerStats",
      authFullRole,
      CustomerController.getCustomerStats
    );
    this.router.post(
      "/changePassword",
      // authFullRole,
      CustomerController.changePassword
    );
  }
}

export default new CustomerRoutes().router;
