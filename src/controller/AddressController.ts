import { Request, Response } from "express";
import { AddressRepo } from "../repository/AddressRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { District } from "../model/District";
import { Ward } from "../model/Ward";

class AddressController {
  async getAllProvinces(req: Request, res: Response) {
    try {
      const provinceData = await new AddressRepo().retrieveAllProvinces();

      return res.status(200).json({
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

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all districts data!",
        data: districtData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllDistrictsByProvinceId(req: Request, res: Response) {
    try {
      const { province_id } = req.params;

      const districtData = await District.findAll({
        where: { province_id },
        attributes: ["id", "name", "level"],
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all districts data!",
        data: districtData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllWards(req: Request, res: Response) {
    try {
      const wardData = await new AddressRepo().retrieveAllWards();

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all wards data!",
        data: wardData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllWardsByDistrictId(req: Request, res: Response) {
    try {
      const { district_id } = req.params;

      const wardData = await Ward.findAll({
        where: { district_id },
        attributes: ["id", "name", "level"],
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all wards data!",
        data: wardData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new AddressController();
