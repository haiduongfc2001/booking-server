import BaseRoutes from "./base/BaseRouter";
import StaffController from "../controller/StaffController";
import validate from "../helper/validate";
import { createStaffSchema, updateStaffSchema } from "../schema/StaffSchema";
import { authFullRole } from "../middleware/Auth.middleware";

class StaffRoutes extends BaseRoutes {
  public routes(): void {
    this.router.get(
      "/getAllStaffs",
      authFullRole,
      StaffController.getAllStaffs
    );
    this.router.get(
      "/getAllManagers",
      authFullRole,
      StaffController.getAllManagers
    );
    this.router.get(
      "/getAllReceptionists",
      authFullRole,
      StaffController.getAllReceptionists
    );
    this.router.get(
      "/:hotel_id/staff/:staff_id/getStaffById",
      authFullRole,
      StaffController.getStaffById
    );
    this.router.post(
      "/:hotel_id/createStaff",
      authFullRole,
      validate(createStaffSchema),
      StaffController.createStaff
    );
    this.router.patch(
      "/:hotel_id/staff/:staff_id/updateStaff",
      authFullRole,
      validate(updateStaffSchema),
      StaffController.updateStaff
    );
    this.router.delete(
      "/:hotel_id/staff/:staff_id/deleteStaff",
      authFullRole,
      StaffController.deleteStaff
    );
    this.router.post("/staff/login", StaffController.staffLogin);
    this.router.get(
      "/:hotel_id/staff/getAllStaffsByHotelId",
      authFullRole,
      StaffController.getAllStaffsByHotelId
    );
  }
}

export default new StaffRoutes().router;
