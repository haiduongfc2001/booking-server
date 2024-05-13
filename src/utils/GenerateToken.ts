import jwt from "jsonwebtoken";
import { ROLE } from "../config/constant.config";

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export const generateCustomerToken = (
  id: number,
  email: string,
  expiresIn: string = "24h"
): string => {
  const payload: UserPayload = { id, email, role: ROLE.CUSTOMER };
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export const generateMangerToken = (
  id: number,
  email: string,
  expiresIn: string = "24h"
): string => {
  const payload: UserPayload = { id, email, role: ROLE.MANAGER };
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export const generateReceptionistToken = (
  id: number,
  email: string,
  expiresIn: string = "24h"
): string => {
  const payload: UserPayload = { id, email, role: ROLE.RECEPTIONIST };
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export const generateAdminToken = (
  id: number,
  email: string,
  expiresIn: string = "24h"
): string => {
  const payload: UserPayload = { id, email, role: ROLE.ADMIN };
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
