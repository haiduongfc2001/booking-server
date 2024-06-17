import BaseRoutes from "./base/BaseRouter";
import { authFullRole } from "../middleware/Auth.middleware";
import PolicyController from "../controller/PolicyController";

class PolicyRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/:hotel_id/policy/getAllPoliciesByHotelId",
      authFullRole,
      PolicyController.getAllPoliciesByHotelId
    );
    this.router.get(
      "/:hotel_id/policy/:policy_id/getPolicyById",
      authFullRole,
      PolicyController.getPolicyById
    );
    this.router.post(
      "/:hotel_id/policy/createPolicy",
      authFullRole,
      PolicyController.createPolicy
    );
    this.router.post(
      "/:hotel_id/policy/createMultiplePolicies",
      authFullRole,
      PolicyController.createMultiplePolicies
    );
    this.router.patch(
      "/:hotel_id/policy/:policy_id/updatePolicy",
      authFullRole,
      PolicyController.updatePolicy
    );
    this.router.delete(
      "/:hotel_id/policy/:policy_id/deletePolicy",
      authFullRole,
      PolicyController.deletePolicy
    );
  }
}

export default new PolicyRoutes().router;
