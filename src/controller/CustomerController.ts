import { Request, Response } from "express";
import { Customer } from "../model/Customer";
import { CustomerRepo } from "../repository/CustomerRepo";
import ErrorHandler from "../utils/ErrorHandler";
import securePassword from "../utils/SecurePassword";
import { sendVerifyMail } from "../utils/SendVerifyMail";
import bcrypt from "bcrypt";
import { generateCustomerToken } from "../utils/GenerateToken";
import { DEFAULT_MINIO } from "../config/constant.config";
import getFileType from "../utils/GetFileType";
import generateRandomString from "../utils/RandomString";
import { minioConfig } from "../config/minio.config";
import { FavoriteHotel } from "../model/FavoriteHotel";

class CustomerController {
  async createCustomer(req: Request, res: Response) {
    try {
      const newCustomer = new Customer();
      newCustomer.password = req.body.password;
      newCustomer.email = req.body.email;
      newCustomer.full_name = req.body.full_name;
      newCustomer.gender = req.body.gender;
      newCustomer.phone = req.body.phone;
      newCustomer.dob = req.body.dob;
      newCustomer.avatar = req.body.avatar;
      newCustomer.address = req.body.address;
      newCustomer.location = req.body.location;

      await new CustomerRepo().save(newCustomer);

      res.status(201).json({
        status: 201,
        message: "Successfully created customer!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      const customer_id = parseInt(req.params["customer_id"]);

      const existingCustomer = await Customer.findByPk(customer_id);

      if (!existingCustomer) {
        return res.status(404).json({
          status: 404,
          message: "Customer not found!",
        });
      }

      await new CustomerRepo().delete(customer_id);

      return res.status(200).json({
        status: 200,
        message: "Successfully deleted customer!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      const customer_id = parseInt(req.params["customer_id"]);

      const existingCustomer = await Customer.findByPk(customer_id);
      if (!existingCustomer) {
        return res.status(404).json({
          status: 404,
          message: "Customer not found!",
        });
      }

      const retrievedCustomer = await new CustomerRepo().retrieveById(
        customer_id
      );

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched customer by customer_id ${customer_id}!`,
        data: retrievedCustomer,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllCustomers(req: Request, res: Response) {
    try {
      const allCustomers = await new CustomerRepo().retrieveAll();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all customer data!",
        data: allCustomers,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const customer_id = parseInt(req.params["customer_id"], 10);

      if (isNaN(customer_id)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid customer ID!",
        });
      }

      const customerToUpdate = await Customer.findByPk(customer_id);

      if (!customerToUpdate) {
        return res.status(404).json({
          status: 404,
          message: "Customer not found!",
        });
      }

      const fieldsToUpdate: Partial<
        Record<keyof typeof customerToUpdate, any>
      > = {
        password: req.body.password,
        email: req.body.email,
        full_name: req.body.full_name,
        gender: req.body.gender,
        phone: req.body.phone,
        dob: req.body.dob,
        address: req.body.address,
        location: req.body.location,
      };

      for (const [field, value] of Object.entries(fieldsToUpdate)) {
        if (value !== undefined) {
          (customerToUpdate as any)[field] = value;
        }
      }

      if (req.file) {
        const folder = `${DEFAULT_MINIO.CUSTOMER_PATH}/${customer_id}`;

        if (customerToUpdate.avatar) {
          await minioConfig
            .getClient()
            .removeObject(
              DEFAULT_MINIO.BUCKET,
              `${folder}/${customerToUpdate.avatar}`
            );
        }
        const file = req.file as Express.Multer.File;

        // Upload the file to MinIO server with specified object name
        const metaData = { "Content-Type": file.mimetype };
        const typeFile = getFileType(file.originalname);
        const newName = `${Date.now()}_${generateRandomString(16)}.${typeFile}`;
        const objectName = `${folder}/${newName}`;

        await minioConfig
          .getClient()
          .putObject(
            DEFAULT_MINIO.BUCKET,
            objectName,
            file.buffer,
            file.size,
            metaData
          );

        (customerToUpdate as any).avatar = newName;
      }

      await new CustomerRepo().update(customerToUpdate);

      return res.status(200).json({
        status: 200,
        message: "Successfully updated customer data!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async customerRegister(req: Request, res: Response) {
    try {
      const { email, password, full_name, gender } = req.body;

      // Kiểm tra xem người dùng đã tồn tại hay chưa
      const existingCustomer = await Customer.findOne({
        where: {
          email,
        },
      });
      if (existingCustomer) {
        return res
          .status(400)
          .json({ message: "Tài khoản đã tồn tại. Xin vui lòng đăng nhập!" });
      } else {
        // Mã hóa mật khẩu trước khi lưu vào csdl
        const hashedPassword = await securePassword(password);

        const newCustomer = new Customer({
          password: hashedPassword,
          email,
          full_name,
          gender,
          phone: "",
          dob: "",
          avatar: "",
          address: "",
          location: "",
        });

        // Lưu customer vào csdl
        await new CustomerRepo().save(newCustomer);

        const customerData = await Customer.findOne({
          where: {
            email,
          },
        });
        if (customerData) {
          await sendVerifyMail(full_name, email, customerData.id);
          return res.status(200).json({
            status: 201,
            message: "Đăng ký tài khoản thành công!",
          });
        } else {
          res
            .status(404)
            .json({ status: 400, message: "Đăng ký không thành công" });
        }
      }
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async verifyMail(req: Request, res: Response) {
    try {
      await Customer.update(
        { is_verified: true },
        { where: { id: req.query.id } }
      );

      res
        .status(200)
        .json({ status: 200, message: "Xác thực email thành công!" });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async customerLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    // Input validation (optional)
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Vui lòng cung cấp email và mật khẩu!",
      });
    }

    try {
      // Find customer by email
      const customer = await Customer.findOne({ where: { email } });

      if (!customer) {
        return res.status(401).json({
          status: 401,
          message: "Email hoặc mật khẩu không hợp lệ!",
        });
      }

      // Compare password hashes securely
      const isPasswordValid = await bcrypt.compare(password, customer.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: "Email hoặc mật khẩu không hợp lệ!",
        });
      }

      if (!customer.is_verified) {
        return res.status(401).json({
          status: 401,
          message: "Email chưa được xác thực. Vui lòng kiểm tra email của bạn!",
        });
      }

      // Generate JWT with appropriate expiry (consider using refresh tokens)
      const token = generateCustomerToken(customer.id, customer.email);

      // Cập nhật token của khách hàng
      await Customer.update(
        { token },
        {
          where: { email },
        }
      );

      // Login successful
      return res.status(200).json({
        status: 200,
        message: "Đăng nhập thành công!",
        token,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getFavoriteHotelsByCustomerId(req: Request, res: Response) {
    try {
      const customer_id = parseInt(req.params["customer_id"]);

      const existingCustomer = await Customer.findByPk(customer_id);

      if (!existingCustomer) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách hàng!",
        });
      }

      const hotels = await FavoriteHotel.findAll({
        where: {
          customer_id,
        },
      });

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched favorite hotels by customer id ${customer_id}!`,
        data: hotels,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async addFavoriteHotel(req: Request, res: Response) {
    try {
      const { customer_id, hotel_id } = req.body;

      const existingCustomer = await Customer.findByPk(customer_id);

      if (!existingCustomer) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy khách hàng!",
        });
      }

      await FavoriteHotel.create({
        customer_id,
        hotel_id,
      });

      return res.status(200).json({
        status: 200,
        message: "Thêm thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deleteFavoriteHotel(req: Request, res: Response) {
    try {
      const favorite_hotel_id = parseInt(req.params["favorite_hotel_id"]);

      await FavoriteHotel.destroy({
        where: {
          id: favorite_hotel_id,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Xóa thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getCustomerStats(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthCount = await new CustomerRepo().countCustomersByMonth(
        currentYear,
        currentMonth
      );
      const previousMonthCount = await new CustomerRepo().countCustomersByMonth(
        previousYear,
        previousMonth
      );

      let percentageChange: number | null = null;
      if (previousMonthCount !== 0) {
        percentageChange =
          ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      } else if (currentMonthCount > 0) {
        percentageChange = 100; // If no customers in previous month but there are in the current month, it's a 100% increase.
      }

      if (percentageChange !== null) {
        percentageChange = parseFloat(percentageChange.toFixed(2));
      }

      const totalCustomers = await Customer.count();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched customer statistics!",
        data: { totalCustomers, currentMonthCount, percentageChange },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new CustomerController();
