import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getJwtSecret } from "../util";

const ensureLogin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization as string;
  // const secret = process.env.JWT_SECRET as string;
  const secret = getJwtSecret();
  jwt.verify(token, secret, async (err: any, decodedId: any) => {
    if (!decodedId) {
      return res.status(400).send({ message: "You are not login!" });
    }
    req.body.userId = decodedId.id;
    next();
  });
};

export default { ensureLogin };
