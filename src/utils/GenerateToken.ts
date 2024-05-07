import jwt from "jsonwebtoken";

interface UserPayload {
  userId: number;
}

const generateToken = (userId: number, expiresIn: string = "24h"): string => {
  const payload: UserPayload = { userId };
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export default generateToken;
