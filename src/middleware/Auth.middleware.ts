import jwt, {
  Secret,
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ROLE_TYPE } from "../config/enum.config";

interface CustomRequest extends Request {
  token: string | JwtPayload;
}

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

const errorHandler = (err: Error, res: Response) => {
  let errorMessage = "You do not have access to this resource!";
  if (err instanceof TokenExpiredError) {
    errorMessage = "Token has expired";
  } else if (err instanceof JsonWebTokenError) {
    errorMessage = "Invalid token";
  }
  res.status(401).json({
    status: 401,
    error: errorMessage,
  });
};

export const authMiddleware = (roles: ROLE_TYPE[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        throw new Error();
      }

      const JWT_SECRET: Secret | undefined = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not provided");
      }

      const decoded = verifyToken(token, JWT_SECRET);

      if (!roles.includes(decoded.role as ROLE_TYPE)) {
        throw new Error("Unauthorized access");
      }

      (req as CustomRequest).token = decoded;
      next();
    } catch (err: any) {
      errorHandler(err, res);
    }
  };
};

export const authCustomer = authMiddleware([ROLE_TYPE.CUSTOMER]);
export const authReceptionist = authMiddleware([ROLE_TYPE.RECEPTIONIST]);
export const authManager = authMiddleware([ROLE_TYPE.MANAGER]);
export const authAdmin = authMiddleware([ROLE_TYPE.ADMIN]);
export const authCustomerOrReceptionist = authMiddleware([
  ROLE_TYPE.CUSTOMER,
  ROLE_TYPE.RECEPTIONIST,
]);
export const authCustomerOrManager = authMiddleware([
  ROLE_TYPE.CUSTOMER,
  ROLE_TYPE.MANAGER,
]);
export const authCustomerOrAdmin = authMiddleware([
  ROLE_TYPE.CUSTOMER,
  ROLE_TYPE.ADMIN,
]);
export const authReceptionistOrManager = authMiddleware([
  ROLE_TYPE.RECEPTIONIST,
  ROLE_TYPE.MANAGER,
]);
export const authReceptionistOrAdmin = authMiddleware([
  ROLE_TYPE.RECEPTIONIST,
  ROLE_TYPE.ADMIN,
]);
export const authManagerOrAdmin = authMiddleware([
  ROLE_TYPE.MANAGER,
  ROLE_TYPE.ADMIN,
]);
export const authCustomerOrReceptionistOrManager = authMiddleware([
  ROLE_TYPE.CUSTOMER,
  ROLE_TYPE.RECEPTIONIST,
  ROLE_TYPE.MANAGER,
]);
export const authCustomerOrReceptionistOrAdmin = authMiddleware([
  ROLE_TYPE.CUSTOMER,
  ROLE_TYPE.RECEPTIONIST,
  ROLE_TYPE.ADMIN,
]);
export const authReceptionistOrManagerOrAdmin = authMiddleware([
  ROLE_TYPE.RECEPTIONIST,
  ROLE_TYPE.MANAGER,
  ROLE_TYPE.ADMIN,
]);
export const authFullRole = authMiddleware([
  ROLE_TYPE.CUSTOMER,
  ROLE_TYPE.RECEPTIONIST,
  ROLE_TYPE.MANAGER,
  ROLE_TYPE.ADMIN,
]);
