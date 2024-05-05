import BaseRoutes from "./base/BaseRouter";
import StaffController from "../controller/StaffController";
import validate from "../helper/validate";
import { createStaffSchema, updateStaffSchema } from "../schema/StaffSchema";

class StaffRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get("/getAllStaffs", StaffController.getAllStaffs);
    this.router.get(
      "/:hotel_id/getAllStaffsByHotelId",
      StaffController.getAllStaffsByHotelId
    );
    this.router.get("/getAllManagers", StaffController.getAllManagers);
    this.router.get(
      "/getAllReceptionists",
      StaffController.getAllReceptionists
    );
    this.router.get(
      "/:hotel_id/staff/:staff_id/getStaffById",
      StaffController.getStaffById
    );
    this.router.post(
      "/:hotel_id/createStaff",
      validate(createStaffSchema),
      StaffController.createStaff
    );
    this.router.patch(
      "/:hotel_id/staff/:staff_id/updateStaff",
      validate(updateStaffSchema),
      StaffController.updateStaff
    );
    this.router.delete(
      "/:hotel_id/staff/:staff_id/deleteStaff",
      StaffController.deleteStaff
    );
  }
}

export default new StaffRoutes().router;
