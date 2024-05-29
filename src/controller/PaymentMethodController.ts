import { Request, Response } from "express";
import { PaymentMethod } from "../model/PaymentMethod";
import ErrorHandler from "../utils/ErrorHandler";

class PaymentMethodController {
  async createPaymentMethod(req: Request, res: Response) {
    try {
      const { name, description } = req.body;

      const paymentMethod = await PaymentMethod.create({
        name,
        description,
      });

      return res.status(201).json({
        status: 201,
        message: "Payment method created successfully!",
        data: paymentMethod,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getPaymentMethods(req: Request, res: Response) {
    try {
      const paymentMethods = await PaymentMethod.findAll();
      return res.status(200).json({
        status: 200,
        data: paymentMethods,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getPaymentMethodById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({
          status: 404,
          message: "Payment method not found!",
        });
      }
      return res.status(200).json({
        status: 200,
        data: paymentMethod,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updatePaymentMethod(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({
          status: 404,
          message: "Payment method not found!",
        });
      }

      if (name !== undefined) {
        paymentMethod.name = name;
      }

      if (description !== undefined) {
        paymentMethod.description = description;
      }

      await paymentMethod.save();

      return res.status(200).json({
        status: 200,
        message: "Payment method updated successfully!",
        data: paymentMethod,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deletePaymentMethod(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({
          status: 404,
          message: "Payment method not found!",
        });
      }
      await paymentMethod.destroy();
      return res.status(200).json({
        status: 200,
        message: "Payment method deleted successfully!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new PaymentMethodController();
