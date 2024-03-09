import { Request, Response } from "express";
import { Customer } from "../model/Customer";
import { CustomerRepo } from "../repository/CustomerRepo";
import ErrorHandler from "../utils/ErrorHandler";

class CustomerController {
    async createCustomer(req: Request, res: Response) {
        try {
            const newCustomer = new Customer();
            newCustomer.username = req.body.username;
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
            let id = parseInt(req.params["id"]);

            const existingCustomer = await Customer.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingCustomer) {
                return res.status(404).json({
                    status: 404,
                    message: "Customer not found!",
                });
            }

            await new CustomerRepo().delete(id);

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
            let id = parseInt(req.params["id"]);

            const existingCustomer = await Customer.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingCustomer) {
                return res.status(404).json({
                    status: 404,
                    message: "Customer not found!",
                });
            }

            const retrievedCustomer = await new CustomerRepo().retrieveById(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched customer by id ${id}!`,
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
            const id = parseInt(req.params["id"]);
            const customerToUpdate = await Customer.findByPk(id);

            if (!customerToUpdate) {
                return res.status(404).json({
                    status: 404,
                    message: "Customer not found!"
                });
            }

            const fieldsToUpdate = [
                'username', 'password', 'email', 'full_name',
                'gender', 'phone', 'dob', 'avatar', 'address',
                'location'
            ];

            fieldsToUpdate.forEach(field => {
                if (req.body[field]) {
                    (customerToUpdate as any)[field] = req.body[field];
                }
            });

            await customerToUpdate.save();

            res.status(200).json({
                status: 200,
                message: "Successfully updated customer data!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new CustomerController()
