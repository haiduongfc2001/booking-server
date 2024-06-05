import BaseRoutes from "./base/BaseRouter";
import AdminController from "../controller/AdminController";
import { authFullRole } from "../middleware/Auth.middleware";

class AdminRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post(
      "/",
      // authFullRole,
      AdminController.createAdmin
    );
    this.router.get("/", authFullRole, AdminController.getAllAdmins);
    this.router.get("/:id", authFullRole, AdminController.getAdminById);
    this.router.put("/:id", authFullRole, AdminController.updateAdmin);
    this.router.delete("/:id", authFullRole, AdminController.deleteAdmin);
    this.router.post(
      "/login",
      // authFullRole,
      AdminController.adminLogin
    );
  }
}

export default new AdminRoutes().router;
