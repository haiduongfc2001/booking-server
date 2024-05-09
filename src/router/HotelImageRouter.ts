import BaseRoutes from "./base/BaseRouter";
import HotelImageController from "../controller/HotelImageController";
// import validate from "../helper/validate";
// import { createHotelImageSchema } from "../schema/HotelImageSchema";
import multer from "multer";
import { authFullRole } from "../middleware/AuthCustomer";

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class HotelImageRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/:hotel_id/getImages",
      authFullRole,
      HotelImageController.getImagesByHotelId
    );
    this.router.post(
      "/:hotel_id/createHotelImages",
      authFullRole,
      upload.array("images", 5),
      HotelImageController.createHotelImages
    );
    this.router.patch(
      "/:hotel_id/updateImagesByHotelId",
      authFullRole,
      upload.array("image"),
      HotelImageController.updateImagesByHotelId
    );
    this.router.patch(
      "/:hotel_id/image/:hotel_image_id/updateHotelImageById",
      authFullRole,
      HotelImageController.updateHotelImageById
    );
    this.router.delete(
      "/:hotel_id/deleteImages",
      authFullRole,
      HotelImageController.deleteImagesByHotelId
    );
    this.router.delete(
      "/:hotel_id/image/:hotel_image_id/deleteImage",
      authFullRole,
      HotelImageController.deleteHotelImageById
    );
  }
}

export default new HotelImageRoutes().router;
