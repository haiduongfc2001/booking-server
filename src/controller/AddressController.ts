import { Request, Response } from "express";
import { AddressRepo } from "../repository/AddressRepo";
import ErrorHandler from "../utils/ErrorHandler";

class AddressController {
    async getAllProvinces(req: Request, res: Response) {
        try {
            const provinceData = await new AddressRepo().retrieveAllProvinces();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all provinces data!",
                data: provinceData,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }

    async getAllDistricts(req: Request, res: Response) {
        try {
            const districtData = await new AddressRepo().retrieveAllDistricts();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all districts data!",
                data: districtData,
            });
        } catch (error) {
            return ErrorHandler.handleServerError(res, error);
        }
    }
}

export default new AddressController()