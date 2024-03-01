import BaseRoutes from "./base/BaseRouter";
import HotelImageController from "../controller/HotelImageController";

class HotelImageRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/getAll", HotelImageController.findAll);
    }
}

export default new HotelImageRoutes().router