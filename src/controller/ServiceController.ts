import { Request, Response } from "express";
import { Service } from "../model/Service";
import { ServiceRepo } from "../repository/ServiceRepo";
import ErrorHandler from "../utils/ErrorHandler";

class ServiceController {
    async createService(req: Request, res: Response) {
        try {
            const new_service = new Service();
            new_service.name = req.body.name;
            new_service.description = req.body.description;

            await new ServiceRepo().save(new_service);

            res.status(201).json({
                status: 201,
                message: "Successfully created service!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async deleteService(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);
            await new ServiceRepo().delete(id);

            res.status(200).json({
                status: 200,
                message: "Successfully deleted service!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getServiceById(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);
            const new_service = await new ServiceRepo().retrieveById(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched service by id ${id}!`,
                data: new_service,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getAllServices(req: Request, res: Response) {
        try {
            const new_service = await new ServiceRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all service data!",
                data: new_service,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async updateService(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);
            const new_service = new Service();

            new_service.id = id;
            new_service.name = req.body.name;
            new_service.description = req.body.description;

            await new ServiceRepo().update(new_service);

            res.status(200).json({
                status: 200,
                message: "Successfully updated service data!",
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new ServiceController()