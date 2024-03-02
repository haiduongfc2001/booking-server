import BaseRoutes from "./base/BaseRouter";
import HotelImageController from "../controller/HotelImageController";
import validate from "../helper/validate";
import { createHotelImageSchema } from "../schema/HotelImageSchema";
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class HotelImageRoutes extends BaseRoutes {
    public routes(): void {
        this.router.post(
            "/create",
            // validate(createHotelImageSchema),
            upload.array('image'),
            HotelImageController.create
        )
        this.router.get("/getAll", HotelImageController.findAll);
        this.router.get("/detail/:hotel_id", HotelImageController.getUrlsByHotelId);
    }
}

export default new HotelImageRoutes().router