import jwt from "jsonwebtoken";
import { Env } from "../config/env";
import { TAuth,AuthPayloadSchema } from "../validation/auth.validation";

export const generateToken = (payload: TAuth): string => {
  const validated = AuthPayloadSchema.parse(payload);

  return jwt.sign(validated, Env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "PingChat",
  });
};

export const verifyToken = (token: string): TAuth => {
  const decoded = jwt.verify(token, Env.JWT_SECRET);
  
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }

  return AuthPayloadSchema.parse(decoded);
};
