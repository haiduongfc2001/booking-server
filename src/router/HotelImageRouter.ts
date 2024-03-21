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
        this.router.get("/:hotel_id/getImages", HotelImageController.getImagesByHotelId);
        this.router.post(
            "/:hotel_id/createHotelImages",
            // validate(createHotelImageSchema),
            upload.array('image'),
            HotelImageController.createHotelImages
        )
        this.router.patch(
            "/:hotel_id/updateImages",
            upload.array('image'),
            HotelImageController.updateImagesByHotelId
        );
        this.router.delete("/:hotel_id/deleteImages", HotelImageController.deleteImagesByHotelId);
    }
}

export default new HotelImageRoutes().router;