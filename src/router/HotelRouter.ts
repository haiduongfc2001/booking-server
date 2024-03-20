import BaseRoutes from "./base/BaseRouter";
import HotelController from "../controller/HotelController";
import validate from "../helper/validate";
import { createHotelSchema, updateHotelSchema } from "../schema/HotelSchema";
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class HotelRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/getAllHotels", HotelController.getAllHotels);
        this.router.get("/getHotelList", HotelController.getHotelList);
        this.router.get("/:hotel_id/getHotelById", HotelController.getHotelById);
        this.router.get("/:hotel_id/getStaffByHotelId", HotelController.getStaffByHotelId);
        this.router.get("/:hotel_id/getRoomByHotelId", HotelController.getRoomByHotelId);
        this.router.post(
            "/createHotel",
            validate(createHotelSchema),
            HotelController.createHotel
        );
        this.router.patch(
            "/:hotel_id/updateHotel",
            validate(updateHotelSchema),
            HotelController.updateHotel
        );
        this.router.delete("/:hotel_id/deleteHotel", HotelController.deleteHotel);
    }
}

export default new HotelRoutes().router;