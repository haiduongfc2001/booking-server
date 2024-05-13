import { Request, Response } from "express";
import { Staff } from "../model/Staff";
import { StaffRepo } from "../repository/StaffRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { Hotel } from "../model/Hotel";
import bcrypt from "bcrypt";
import { ROLE } from "../config/constant.config";
import {
	generateMangerToken,
	generateReceptionistToken,
} from "../utils/GenerateToken";
import securePassword from "../utils/SecurePassword";

const roleToTokenGenerator = {
	[ROLE.MANAGER]: generateMangerToken,
	[ROLE.RECEPTIONIST]: generateReceptionistToken,
};

class StaffController {
	async createStaff(req: Request, res: Response) {
		try {
			const hotel_id = parseInt(req.params.hotel_id);
			const { email, password, full_name, gender, role } = req.body;

			const existingHotel = await Hotel.findByPk(hotel_id);
			if (!existingHotel) {
				return res.status(400).json({
					status: 400,
					message: "Hotel not found!",
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
					message: "Email already exists!",
				});
			}
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

			return res.status(201).json({
				status: 201,
				message: "Successfully created staff!",
			});
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
				message: "Successfully deleted staff!",
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
						message: "Hotel not found!",
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
}

export default new StaffController();
