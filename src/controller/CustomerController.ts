import { Request, Response } from "express";
import { Customer } from "../model/Customer";
import { CustomerRepo } from "../repository/CustomerRepo";

class CustomerController {
    async create(req: Request, res: Response) {
        try {
            const new_customer = new Customer();
            new_customer.username = req.body.username;
            new_customer.password = req.body.password;
            new_customer.email = req.body.email;
            new_customer.full_name = req.body.full_name;
            new_customer.gender = req.body.gender;
            new_customer.phone = req.body.phone;
            new_customer.avatar_url = req.body.avatar_url;
            new_customer.address = req.body.address;
            new_customer.location = req.body.location;

            // const existingCustomer = await Customer.findOne({
            //     where: {
            //         username: req.body.username,
            //     }
            // })

            // if (existingCustomer) {
            //     return res.status(400).json({
            //         status: "Bad Request",
            //         message: "Username already exists!"
            //     });
            // }

            await new CustomerRepo().save(new_customer);

            res.status(201).json({
                status: 201,
                message: "Successfully created customer!",
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);

            const existingCustomer = await Customer.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingCustomer) {
                return res.status(400).json({
                    status: "Bad Request",
                    message: "Customer not found!",
                });
            }

            await new CustomerRepo().delete(id);

            res.status(200).json({
                status: 200,
                message: "Successfully deleted customer!",
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);

            const existingCustomer = await Customer.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingCustomer) {
                return res.status(400).json({
                    status: "Bad Request",
                    message: "Customer not found!",
                });
            }

            const new_customer = await new CustomerRepo().retrieveById(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched customer by id ${id}!`,
                data: new_customer,
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const new_customer = await new CustomerRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all customer data!",
                data: new_customer,
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params["id"]);
            const customerToUpdate = await Customer.findByPk(id);

            if (!customerToUpdate) {
                return res.status(404).json({
                    status: "Not Found",
                    message: "Customer not found"
                });
            }

            const fieldsToUpdate = [
                'username', 'password', 'email', 'full_name',
                'gender', 'phone', 'avatar_url', 'address',
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
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

}

export default new CustomerController()