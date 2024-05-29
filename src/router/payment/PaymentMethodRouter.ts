import PaymentMethodController from "../../controller/PaymentMethodController";
import { authFullRole } from "../../middleware/Auth.middleware";
import BaseRoutes from "../base/BaseRouter";

class AddressRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/createPaymentMethod",
      authFullRole,
      PaymentMethodController.createPaymentMethod
    );
    this.router.get(
      "/getPaymentMethods",
      authFullRole,
      PaymentMethodController.getPaymentMethods
    );
    this.router.get(
      "/getPaymentMethodById/:id",
      authFullRole,
      PaymentMethodController.getPaymentMethodById
    );
    this.router.put(
      "/updatePaymentMethod/:id",
      authFullRole,
      PaymentMethodController.updatePaymentMethod
    );
    this.router.delete(
      "/deletePaymentMethod/:id",
      authFullRole,
      PaymentMethodController.deletePaymentMethod
    );
  }
}

export default new AddressRoutes().router;
