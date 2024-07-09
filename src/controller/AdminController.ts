import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { Admin } from "../model/Admin";
import securePassword from "../utils/SecurePassword";
import bcrypt from "bcrypt";
import { DEFAULT_MINIO, ROLE } from "../config/constant.config";
import { generateAdminToken } from "../utils/GenerateToken";
import { minioConfig } from "../config/minio.config";

const roleToTokenGenerator = {
  [ROLE.ADMIN]: generateAdminToken,
};

class AdminController {
  async createAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const existingAdmin = await Admin.findOne({ where: { email } });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      const hashedPassword = await securePassword(password);

      const newAdmin = await Admin.create({
        email,
        password: hashedPassword,
      });

      return res
        .status(201)
        .json({ message: "Tạo tài khoản admin thành công", data: newAdmin });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllAdmins(req: Request, res: Response) {
    try {
      const admins = await Admin.findAll();
      return res.status(200).json({ data: admins });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAdminById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const admin = await Admin.findByPk(id);

      if (!admin) {
        return res.status(404).json({ message: "Không tìm thấy thông tin!" });
      }

      return res.status(200).json({ data: admin });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, password } = req.body;

      const admin = await Admin.findByPk(id);

      if (!admin) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy thông tin admin!" });
      }

      if (email) admin.email = email;
      if (password) admin.password = await securePassword(password);

      await admin.save();

      return res
        .status(200)
        .json({ message: "Cập nhật thông tin thành công", data: admin });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const admin = await Admin.findByPk(id);

      if (!admin) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy thông tin admin!" });
      }

      await admin.destroy();

      return res
        .status(200)
        .json({ message: "Xóa tài khoản admin thành công!" });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async adminLogin(req: Request, res: Response) {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        status: 400,
        message: "Vui lòng cung cấp email, mật khẩu và vai trò của bạn!",
      });
    }

    try {
      const admin = await Admin.findOne({ where: { email } });

      if (!admin) {
        return res.status(401).json({
          status: 401,
          message: "Email hoặc mật khẩu không hợp lệ!",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: "Email hoặc mật khẩu không hợp lệ!",
        });
      }

      const tokenGenerator = roleToTokenGenerator[role];
      if (!tokenGenerator) {
        return res.status(400).json({
          status: 400,
          message: "Vai trò không hợp lệ!",
        });
      }
      const token = tokenGenerator(admin.id, admin.email);

      await Admin.update(
        { token },
        {
          where: { email },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Đăng nhập thành công!",
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          avatar:
            "https://static.vecteezy.com/system/resources/previews/009/784/096/original/avatar-with-gear-flat-design-icon-of-manager-vector.jpg",
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({
        where: {
          email,
        },
      });

      if (!admin) {
        return res.status(404).json({
          status: 404,
          message: "Admin not found!",
        });
      }

      const hashedPassword = await securePassword(password);

      await Admin.update(
        { password: hashedPassword },
        {
          where: { email },
        }
      );

      return res.status(200).json({
        status: 200,
        message: "Cập nhật mật khẩu thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new AdminController();
