import { Request, Response } from "express";
import { AddressRepo } from "../repository/AddressRepo";
import ErrorHandler from "../utils/ErrorHandler";

class AddressController {
    async getAllProvinces(req: Request, res: Response) {
        try {
            const addresssData = await new AddressRepo().retrieveAllProvinces();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all provinces data!",
                data: addresssData,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new AddressController()