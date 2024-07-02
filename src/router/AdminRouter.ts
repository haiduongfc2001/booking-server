import BaseRoutes from "./base/BaseRouter";
import AdminController from "../controller/AdminController";
import { authAdmin } from "../middleware/Auth.middleware";

class AdminRoutes extends BaseRoutes {
  public routes(): void {
    this.router.post("/", authAdmin, AdminController.createAdmin);
    this.router.get("/", authAdmin, AdminController.getAllAdmins);
    this.router.get("/:id", authAdmin, AdminController.getAdminById);
    this.router.put("/:id", authAdmin, AdminController.updateAdmin);
    this.router.delete("/:id", authAdmin, AdminController.deleteAdmin);
    this.router.post("/login", AdminController.adminLogin);
  }
}

export default new AdminRoutes().router;
