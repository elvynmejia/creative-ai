import { NextFunction, type Request, type Response } from "express";
import { findUserUuidByIp } from "../user";

export default async (req: Request, res: Response, next: NextFunction) => {
  console.info("Entering anon user middleware", req.cookies.anonUser);

  const uuid = await findUserUuidByIp(req.cookies.anonUser);

  if (!uuid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = { id: uuid };

  next();
};
