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
        this.router.get("/", HotelController.getAllHotels);
        this.router.get("/:id", HotelController.getHotelById);
        this.router.post(
            "/",
            validate(createHotelSchema),
            HotelController.createHotel
        );
        this.router.post(
            "/upload/hotel-photo",
            upload.single('image'),
            HotelController.uploadHotelPhoto
        );
        this.router.patch(
            "/:id",
            validate(updateHotelSchema),
            HotelController.updateHotel
        );
        this.router.delete("/:id", HotelController.deleteHotel);

    }
}

export default new HotelRoutes().router