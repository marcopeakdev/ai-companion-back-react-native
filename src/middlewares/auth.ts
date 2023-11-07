import jwt from "jsonwebtoken";
import User from "../models/user";
import { Request, Response, NextFunction } from "express";

const ensureLogin = (req: Request, res: Response, next: NextFunction) => {
  console.log('auth', req.headers.authorization);
  const userId = req.headers.authorization as string;
  const secret = process.env.JWT_SECRET as string;
  jwt.verify(JSON.parse(userId), secret, async (err: any, decodedId: any) => {
    console.log("decodedId", decodedId);
    if (!decodedId) {
      return res.status(400).send({ message: "You are not login!" });
    }
    req.body.userId = decodedId.id;
    next();
  });
};

export default { ensureLogin };