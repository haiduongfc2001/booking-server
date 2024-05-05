import { Response } from "express";

class ErrorHandler {
  static handleServerError(res: Response, error: any): Response {
    console.error("Server error: ", error);

    return res.status(500).json({
      status: 500,
      message: "Internal Server Error!",
    });
  }
}

export default ErrorHandler;
