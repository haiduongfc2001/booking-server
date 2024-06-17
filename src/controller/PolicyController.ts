import { Request, Response } from "express";
import { Policy } from "../model/Policy";
import ErrorHandler from "../utils/ErrorHandler";
import { Hotel } from "../model/Hotel";

class PolicyController {
  async getAllPoliciesByHotelId(req: Request, res: Response) {
    try {
      const { hotel_id } = req.params;

      const policies = await Policy.findAll({
        where: {
          hotel_id,
        },
        order: [["updated_at", "desc"]],
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all policy data!",
        data: policies,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getPolicyById(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const policy_id = parseInt(req.params.policy_id);

      const existingPolicy = await Policy.findOne({
        where: {
          id: policy_id,
          hotel_id,
        },
      });

      if (!existingPolicy) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy chính sách!",
        });
      }

      return res.status(200).json({
        status: 200,
        message: `Successfully fetched policy by id ${policy_id}!`,
        data: existingPolicy,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async createPolicy(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const { type, value, description } = req.body;

      const existingHotel = await Hotel.findByPk(hotel_id);
      if (!existingHotel) {
        return res.status(400).json({
          status: 400,
          message: "Không tìm thấy khách sạn!",
        });
      }

      const existingPolicy = await Policy.findOne({
        where: {
          type,
          hotel_id,
        },
      });

      if (existingPolicy) {
        return res.status(400).json({
          status: 400,
          message: "Chính sách đã tồn tại!",
        });
      }

      const newPolicy = await Policy.create({
        type,
        value,
        description,
        hotel_id,
      });

      return res.status(201).json({
        status: 201,
        message: "Tạo chính sách mới thành công!",
        data: newPolicy,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async createMultiplePolicies(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const policies = req.body.policies;

      const existingHotel = await Hotel.findByPk(hotel_id);
      if (!existingHotel) {
        return res.status(400).json({
          status: 400,
          message: "Không tìm thấy khách sạn!",
        });
      }

      // Validate each policy
      for (const policy of policies) {
        const { type, value, description } = policy;

        const existingPolicy = await Policy.findOne({
          where: {
            type,
            hotel_id,
          },
        });

        if (existingPolicy) {
          return res.status(400).json({
            status: 400,
            message: `Chính sách với loại ${type} đã tồn tại!`,
          });
        }
      }

      // Create multiple policies
      const newPolicies = await Policy.bulkCreate(
        policies.map((policy: Policy) => ({
          ...policy,
          hotel_id,
        }))
      );

      return res.status(201).json({
        status: 201,
        message: "Tạo nhiều chính sách mới thành công!",
        data: newPolicies,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updatePolicy(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const policy_id = parseInt(req.params.policy_id);

      const policyToUpdate = await Policy.findOne({
        where: {
          id: policy_id,
          hotel_id,
        },
      });

      if (!policyToUpdate) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy chính sách!",
        });
      }

      const fieldsToUpdate = ["type", "value", "description"];
      const updatedFields: any = {};

      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) {
          updatedFields[field] = req.body[field];
        }
      });

      if (req.body?.hotel_id) {
        const newHotelId = parseInt(req.body.hotel_id);
        const hotel = await Hotel.findByPk(newHotelId);

        if (!hotel) {
          return res.status(404).json({
            status: 404,
            message: "Không tìm thấy khách sạn!",
          });
        }
        updatedFields.hotel_id = newHotelId;
      }

      await Policy.update(updatedFields, {
        where: {
          id: policy_id,
          hotel_id,
        },
      });

      return res.status(200).json({
        status: 200,
        message: "Cập nhật chính sách thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deletePolicy(req: Request, res: Response) {
    try {
      const hotel_id = parseInt(req.params.hotel_id);
      const policy_id = parseInt(req.params.policy_id);

      const existingPolicy = await Policy.findOne({
        where: {
          id: policy_id,
          hotel_id,
        },
      });

      if (!existingPolicy) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy chính sách!",
        });
      }

      await existingPolicy.destroy();

      return res.status(200).json({
        status: 200,
        message: "Xóa chính sách thành công!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new PolicyController();
