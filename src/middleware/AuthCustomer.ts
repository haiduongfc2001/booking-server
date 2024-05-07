import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const authCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error();
    }

    const JWT_SECRET: Secret | undefined = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not provided");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    let errorMessage = "Please authenticate!";
    if (err instanceof jwt.TokenExpiredError) {
      errorMessage = "Token has expired";
    } else if (err instanceof jwt.JsonWebTokenError) {
      errorMessage = "Invalid token";
    }
    res.status(401).json({
      status: 401,
      error: errorMessage,
    });
  }
};
