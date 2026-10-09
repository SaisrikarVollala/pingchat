import jwt from "jsonwebtoken";
import { Env } from "../config/env";
import { AuthToken, AuthTokenSchema } from "../validation/auth.validation";


export const generateToken = (payload: AuthToken): string => {
  // Validate payload at runtime
  const validated = AuthTokenSchema.parse(payload);
  const token = {
    _id: validated._id,
    username: validated.username,
    displayName: validated.displayName,
    avatarUrl: validated.avatarUrl,
    email: validated.email,
  };
  return jwt.sign(token, Env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "PingChat",
  });
};


export const verifyToken = (token: string): AuthToken => {
  const decoded = jwt.verify(token, Env.JWT_SECRET);

  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }

  return AuthTokenSchema.parse(decoded);
};
