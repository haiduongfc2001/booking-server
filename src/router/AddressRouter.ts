import BaseRoutes from "./base/BaseRouter";
import AddressController from "../controller/AddressController";

class AddressRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get("/getAllProvinces", AddressController.getAllProvinces);
    this.router.get("/getAllDistricts", AddressController.getAllDistricts);
    this.router.get("/getAllWards", AddressController.getAllWards);
    this.router.get(
      "/province/:province_id/districts/getAll",
      AddressController.getAllDistrictsByProvinceId
    );
    this.router.get(
      "/province/district/:district_id/wards/getAll",
      AddressController.getAllWardsByDistrictId
    );
  }
}

export default new AddressRoutes().router;
