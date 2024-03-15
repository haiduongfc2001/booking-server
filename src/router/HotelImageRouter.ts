import BaseRoutes from "./base/BaseRouter";
import HotelImageController from "../controller/HotelImageController";
// import validate from "../helper/validate";
// import { createHotelImageSchema } from "../schema/HotelImageSchema";
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class HotelImageRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/:hotel_id", HotelImageController.getImagesByHotelId);
        this.router.post(
            "/",
            // validate(createHotelImageSchema),
            upload.array('image'),
            HotelImageController.createImages
        )
        this.router.patch(
            "/:hotel_id",
            upload.array('image'),
            HotelImageController.updateImagesByHotelId
        );
        this.router.delete("/:hotel_id", HotelImageController.deleteImagesByHotelId);
    }
}

export default new HotelImageRoutes().router