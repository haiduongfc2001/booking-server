import BaseRoutes from "./base/BaseRouter";
import AddressController from "../controller/AddressController";

class AddressRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/getAllProvinces", AddressController.getAllProvinces);
    }
}

export default new AddressRoutes().router;