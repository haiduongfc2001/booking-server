import BaseRoutes from "./base/BaseRouter";
import CustomerController from "../controller/CustomerController";
import validate from "../helper/validate";
import { createCustomerSchema, updateCustomerSchema } from "../schema/CustomerSchema";
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


class CustomerRoutes extends BaseRoutes {
    public routes(): void {
        this.router.post("/create", validate(createCustomerSchema), CustomerController.create);
        this.router.patch(
            "/update/:id",
            validate(updateCustomerSchema),
            CustomerController.update
        );
        this.router.delete("/delete/:id", CustomerController.delete);
        this.router.get("/getAll", CustomerController.findAll);
        this.router.get("/detail/:id", CustomerController.findById);
        this.router.post("/upload/hotel-photo", upload.single('image'), CustomerController.uploadHotelPhoto);
    }
}

export default new CustomerRoutes().router