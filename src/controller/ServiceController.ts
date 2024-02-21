import { Request, Response } from "express";
import { Service } from "../model/Service";
import { ServiceRepo } from "../repository/ServiceRepo";

class ServiceController {
    async create(req: Request, res: Response) {
        try {
            const new_service = new Service();
            new_service.name = req.body.name;
            new_service.description = req.body.description;

            await new ServiceRepo().save(new_service);

            res.status(201).json({
                status: "Created!",
                message: "Successfully created service!",
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
            await new ServiceRepo().delete(id);

            res.status(200).json({
                status: "Ok!",
                message: "Successfully deleted service!",
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
            const new_service = await new ServiceRepo().retrieveById(id);

            res.status(200).json({
                status: "Ok!",
                message: `Successfully fetched service by id ${id}!`,
                data: new_service,
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
            const new_service = await new ServiceRepo().retrieveAll();

            res.status(200).json({
                status: "Ok!",
                message: "Successfully fetched all service data!",
                data: new_service,
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
            let id = parseInt(req.params["id"]);
            const new_service = new Service();

            new_service.id = id;
            new_service.name = req.body.name;
            new_service.description = req.body.description;

            await new ServiceRepo().update(new_service);

            res.status(200).json({
                status: "Ok!",
                message: "Successfully updated service data!",
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }
}

export default new ServiceController()