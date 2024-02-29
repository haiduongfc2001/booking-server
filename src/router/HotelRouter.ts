import BaseRoutes from "./base/BaseRouter";
import HotelController from "../controller/HotelController";
import validate from "../helper/validate";
import { createHotelSchema, updateHotelSchema } from "../schema/HotelSchema";

class HotelRoutes extends BaseRoutes {
    public routes(): void {
        this.router.post("/create", validate(createHotelSchema), HotelController.create);
        // this.router.patch(
        //     "/update/:id",
        //     validate(updateHotelSchema),
        //     HotelController.update
        // );
        // this.router.delete("/delete/:id", HotelController.delete);
        this.router.get("/getAll", HotelController.findAll);
        // this.router.get("/detail/:id", HotelController.findById);
    }
}

export default new HotelRoutes().router