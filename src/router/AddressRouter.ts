import BaseRoutes from "./base/BaseRouter";
import AddressController from "../controller/AddressController";
import { authFullRole } from "../middleware/Auth.middleware";

class AddressRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllProvinces",
      // authFullRole,
      AddressController.getAllProvinces
    );
    this.router.get(
      "/getAllDistricts",
      // authFullRole,
      AddressController.getAllDistricts
    );
    this.router.get(
      "/getAllWards",
      // authFullRole,
      AddressController.getAllWards
    );
    this.router.get(
      "/province/:province_id/districts/getAll",
      // authFullRole,
      AddressController.getAllDistrictsByProvinceId
    );
    this.router.get(
      "/province/district/:district_id/wards/getAll",
      // authFullRole,
      AddressController.getAllWardsByDistrictId
    );
  }
}

export default new AddressRoutes().router;
