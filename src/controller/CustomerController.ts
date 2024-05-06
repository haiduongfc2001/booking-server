import { Request, Response } from "express";
import { Customer } from "../model/Customer";
import { CustomerRepo } from "../repository/CustomerRepo";
import ErrorHandler from "../utils/ErrorHandler";
import securePassword from "../utils/SecurePassword";
import sendVerifyMail from "../utils/SendVerifyMail";
import { where } from "sequelize";

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

			res.status(200).json({
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

			res.status(200).json({
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

			res.status(200).json({
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
			const customer_id = parseInt(req.params["customer_id"]);

			const customerToUpdate = await Customer.findByPk(customer_id);

			if (!customerToUpdate) {
				return res.status(404).json({
					status: 404,
					message: "Customer not found!",
				});
			}

			const fieldsToUpdate = [
				"password",
				"email",
				"full_name",
				"gender",
				"phone",
				"dob",
				"avatar",
				"address",
				"location",
			];

			fieldsToUpdate.forEach((field) => {
				if (req.body[field]) {
					(customerToUpdate as any)[field] = req.body[field];
				}
			});

			await new CustomerRepo().update(customerToUpdate);

			res.status(200).json({
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
						message:
							"Xin vui lòng xác thực tài khoản trong tin nhắn được chúng tôi gửi trong email của bạn!",
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
		try {
		} catch (error) {
			return ErrorHandler.handleServerError(res, error);
		}
	}
}

export default new CustomerController();
