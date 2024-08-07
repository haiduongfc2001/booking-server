import { Request, Response } from "express";
import { Staff } from "../model/Staff";
import { StaffRepo } from "../repository/StaffRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { Hotel } from "../model/Hotel";
import bcrypt from "bcrypt";
import { DEFAULT_MINIO, ROLE } from "../config/constant.config";
import {
  generateMangerToken,
  generateReceptionistToken,
} from "../utils/GenerateToken";
import securePassword from "../utils/SecurePassword";
import generateRandomString from "../utils/RandomString";
import { sendMailPassword } from "../utils/SendVerifyMail";
import { minioConfig } from "../config/minio.config";

const roleToTokenGenerator = {
  [ROLE.MANAGER]: generateMangerToken,
  [ROLE.RECEPTIONIST]: generateReceptionistToken,
};

class StaffController {
  async createStaff(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const { email, full_name, gender, phone, role } = req.body;

      const existingHotel = await Hotel.findByPk(hotel_id);
      if (!existingHotel) {
        return res.status(400).json({
          status: 400,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const existingEmail = await Staff.findOne({
        where: {
          email,
        },
      });

      if (existingEmail) {
        return res.status(400).json({
          status: 400,
          message: "Email đã tồn tại!",
        });
      }

      const password = generateRandomString(8, true);

      const hashedPassword = await securePassword(password);

      const newStaff = new Staff({
        email,
        password: hashedPassword,
        full_name,
        gender,
        phone: "",
        avatar: "",
        hotel_id,
        role,
      });

      await new StaffRepo().save(newStaff);

      const staffData = await Staff.findOne({
        where: {
          email,
        },
      });
      if (staffData) {
        await sendMailPassword(full_name, email, password, staffData.id);
        return res.status(201).json({
          status: 201,
          message: "Tạo tài khoản mới thành công!",
        });
      } else {
        res
          .status(404)
          .json({ status: 400, message: "Tạo tài khoản mới không thành công" });
      }
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteStaff(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const staff_id = parseInt(req.params.staff_id);

      const existingStaff = await Staff.findOne({
        where: {
          id: staff_id,
          hotel_id,
        },
      });

      if (!existingStaff) {
        return res.status(404).json({
          status: 404,
          message: "Staff not found!",
        });
      }

      await new StaffRepo().delete(staff_id);

      return res.status(200).json({
        status: 200,
        message: "Xóa nhân viên thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getStaffById(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const staff_id = parseInt(req.params.staff_id);

      const existingStaff = await Staff.findOne({
        where: {
          id: staff_id,
          hotel_id,
        },
      });

      if (!existingStaff) {
        return res.status(404).json({
          status: 404,
          message: "Staff not found!",
        });
      }

      const staff = await new StaffRepo().retrieveById(staff_id);

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched staff by id ${staff_id}!`,
        data: staff,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllStaffs(req: Request, res: Response) {
    try {
      const staffs = await new StaffRepo().retrieveAll();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all staff data!",
        data: staffs,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllManagers(req: Request, res: Response) {
    try {
      const managers = await new StaffRepo().retrieveAllManagers();

      return res.status(200).json({
        status: 200,
        message: "Successfully retrieved all managers!",
        data: managers,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllReceptionists(req: Request, res: Response) {
    try {
      const new_receptionist = await new StaffRepo().retrieveAllReceptionists();

      return res.status(200).json({
        status: 200,
        message: "Successfully retrieved all receptionists!",
        data: new_receptionist,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateStaff(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const staff_id = parseInt(req.params.staff_id);

      const staffToUpdate = await Staff.findOne({
        where: {
          id: staff_id,
          hotel_id,
        },
      });

      if (!staffToUpdate) {
        return res.status(404).json({
          status: 404,
          message: "Staff not found!",
        });
      }

      const fieldsToUpdate = [
        "email",
        "password",
        "full_name",
        "gender",
        "phone",
        "avatar",
        "role",
      ];

      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) {
          (staffToUpdate as any)[field] = req.body[field];
        }
      });

      if (req.body?.hotel_id) {
        const hotel_id = req.body.hotel_id;
        const hotel = await Hotel.findByPk(parseInt(hotel_id));

        if (!hotel) {
          return res.status(404).json({
            status: 404,
            message: "Không tìm thấy khách sạn!",
          });
        }
        staffToUpdate.hotel_id = parseInt(hotel_id);
      }

      await new StaffRepo().update(staffToUpdate);

      return res.status(200).json({
        status: 200,
        message: "Successfully updated staff data!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async staffLogin(req: Request, res: Response) {
    const { email, password, role } = req.body;

    // Input validation (optional)
    if (!email || !password || !role) {
      return res.status(400).json({
        status: 400,
        message: "Vui lòng cung cấp email, mật khẩu và vai trò của bạn!",
      });
    }

    try {
      // Find staff by email
      const staff = await Staff.findOne({ where: { email, role } });

      if (!staff) {
        return res.status(401).json({
          status: 401,
          message: "Email hoặc mật khẩu không hợp lệ!",
        });
      }

      // Compare password hashes securely
      const isPasswordValid = await bcrypt.compare(password, staff.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: "Email hoặc mật khẩu không hợp lệ!",
        });
      }

      // Generate JWT with appropriate expiry (consider using refresh tokens)
      const tokenGenerator = roleToTokenGenerator[role];
      if (!tokenGenerator) {
        return res.status(400).json({
          status: 400,
          message: "Vai trò không hợp lệ!",
        });
      }
      const token = tokenGenerator(staff.id, staff.email);

      // Cập nhật token của khách hàng
      await Staff.update(
        { token },
        {
          where: { email },
        }
      );

      const avatar = staff?.avatar
        ? await new Promise<string | null>((resolve, reject) => {
            minioConfig
              .getClient()
              .presignedGetObject(
                DEFAULT_MINIO.BUCKET,
                `${DEFAULT_MINIO.CUSTOMER_PATH}/${staff.id}/${staff.avatar}`,
                24 * 60 * 60,
                (err, presignedUrl) => {
                  if (err) {
                    console.error("Error generating avatar URL:", err);
                    resolve(null);
                  } else {
                    resolve(presignedUrl);
                  }
                }
              );
          })
        : null;

      // Login successful
      return res.status(200).json({
        status: 200,
        message: "Đăng nhập thành công!",
        token,
        staff: {
          id: staff.id,
          hotel_id: staff.hotel_id,
          email: staff.email,
          full_name: staff.full_name,
          avatar,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllStaffsByHotelId(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;

      const staffs = await Staff.findAll({
        where: {
          hotel_id,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all staff data!",
        data: staffs,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const staff = await Staff.findOne({
        where: {
          email,
        },
      });

      if (!staff) {
        return res.status(404).json({
          status: 404,
          message: "Staff not found!",
        });
      }

      const hashedPassword = await securePassword(password);

      await Staff.update(
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

export default new StaffController();
