import BaseRoutes from "./base/BaseRouter";
import StaffController from "../controller/StaffController";
import validate from "../helper/validate";
import { createStaffSchema, updateStaffSchema } from "../schema/StaffSchema";


class StaffRoutes extends BaseRoutes {
    public routes(): void {
        this.router.get("/", StaffController.getAllStaffs);
        this.router.get("/manager", StaffController.getAllManagers);
        this.router.get("/receptionist", StaffController.getAllReceptionists);
        this.router.get("/:id", StaffController.getStaffById);
        this.router.post(
            "/",
            validate(createStaffSchema),
            StaffController.createStaff
        );
        this.router.patch(
            "/:id",
            validate(updateStaffSchema),
            StaffController.updateStaff
        );
        this.router.delete("/:id", StaffController.deleteStaff);
    }
}

export default new StaffRoutes().router;