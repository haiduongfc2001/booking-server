import { Request, Response } from "express";
import { Service } from "../model/Service";
import { ServiceRepo } from "../repository/ServiceRepo";
import ErrorHandler from "../utils/ErrorHandler";

class ServiceController {
    async createService(req: Request, res: Response) {
        try {
            const newService = new Service();
            newService.name = req.body.name;
            newService.description = req.body.description;

            await new ServiceRepo().save(newService);

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
            const service_id = parseInt(req.params?.service_id);
            await new ServiceRepo().delete(service_id);

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
            const service_id = parseInt(req.params?.service_id);
            const service = await new ServiceRepo().retrieveById(service_id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched service by id ${service_id}!`,
                data: service,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getAllServices(req: Request, res: Response) {
        try {
            const services = await new ServiceRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all service data!",
                data: services,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async updateService(req: Request, res: Response) {
        try {
            const service_id = parseInt(req.params?.service_id);
            const updatedService = new Service();

            updatedService.id = service_id;
            updatedService.name = req.body.name;
            updatedService.description = req.body.description;

            await new ServiceRepo().update(updatedService);

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
