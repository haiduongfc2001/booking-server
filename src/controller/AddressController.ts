import { Request, Response } from "express";
import { AddressRepo } from "../repository/AddressRepo";
import ErrorHandler from "../utils/ErrorHandler";
import { District } from "../model/District";
import { Ward } from "../model/Ward";
import { Op } from "sequelize";
import { Province } from "../model/Province";

class AddressController {
  async getAllProvinces(req: Request, res: Response) {
    try {
      const provinceData = await new AddressRepo().retrieveAllProvinces();

      return res.status(200).json({
        status: 200,
        message: "Đã tìm nạp thành công tất cả dữ liệu tỉnh!",
        data: provinceData,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getAllDistricts(req: Request, res: Response) {
    try {
      const { location } = req.query;
      let whereClause = {};

      const province = await Province.findOne({
        where: { name: { [Op.iLike]: `%${location}%` } },
      });

      if (!province) {
        return res.status(404).json({
          status: 404,
          message: "Tỉnh này không tồn tại!",
        });
      }

      if (location) {
        whereClause = { province_id: province.id };
      }

      const districtData = await District.findAll({
        where: whereClause,
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all districts data!",
        province_id: province.id,
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
