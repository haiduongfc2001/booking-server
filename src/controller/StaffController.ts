import { Request, Response } from "express";
import { Staff } from "../model/Staff";
import { StaffRepo } from "../repository/StaffRepo";
import ErrorHandler from "../utils/ErrorHandler";

class StaffController {
    async createStaff(req: Request, res: Response) {
        try {
            // const existingStaff = await Staff.findOne({
            //     where: {
            //         username: req.body.username,
            //     }
            // })

            // if (existingStaff) {
            //     return res.status(400).json({
            //         status: 400,
            //         message: "Username already exists!"
            //     });
            // }

            const new_staff = new Staff();
            new_staff.email = req.body.email;
            new_staff.password = req.body.password;
            new_staff.full_name = req.body.full_name;
            new_staff.gender = req.body.gender;
            new_staff.phone = req.body.phone;
            new_staff.dob = req.body.dob;
            new_staff.avatar = req.body.avatar;
            new_staff.hotel_id = req.body.hotel_id;
            new_staff.role = req.body.role;

            await new StaffRepo().save(new_staff);

            res.status(201).json({
                status: 201,
                message: "Successfully created staff!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async deleteStaff(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);

            const existingStaff = await Staff.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingStaff) {
                return res.status(404).json({
                    status: 404,
                    message: "Staff not found!",
                });
            }

            await new StaffRepo().delete(id);

            res.status(200).json({
                status: 200,
                message: "Successfully deleted staff!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getStaffById(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);

            const existingStaff = await Staff.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingStaff) {
                return res.status(404).json({
                    status: 404,
                    message: "Staff not found!",
                });
            }

            const new_staff = await new StaffRepo().retrieveById(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched staff by id ${id}!`,
                data: new_staff,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getAllStaffs(req: Request, res: Response) {
        try {
            const new_staff = await new StaffRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all staff data!",
                data: new_staff,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getAllManagers(req: Request, res: Response) {
        try {
            const new_manager = await new StaffRepo().retrieveAllManagers();

            res.status(200).json({
                status: 200,
                message: "Successfully retrieved all managers!",
                data: new_manager,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getAllReceptionists(req: Request, res: Response) {
        try {
            const new_receptionist = await new StaffRepo().retrieveAllReceptionists();

            res.status(200).json({
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
            const id = parseInt(req.params["id"]);
            const staffToUpdate = await Staff.findByPk(id);

            if (!staffToUpdate) {
                return res.status(404).json({
                    status: 404,
                    message: "Staff not found!"
                });
            }

            const fieldsToUpdate = [
                'email', 'password', 'full_name',
                'gender', 'phone', 'dob', 'avatar', 'hotel_id',
                'role'
            ];

            fieldsToUpdate.forEach(field => {
                if (req.body[field]) {
                    (staffToUpdate as any)[field] = req.body[field];
                }
            });

            await staffToUpdate.save();

            res.status(200).json({
                status: 200,
                message: "Successfully updated staff data!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new StaffController()