import { type Request, type Response } from "express";

import { v4 } from "uuid";

import {
  saveUserIpToUuid,
  cookieOptions,
  findUserUuidByIp,
  saveUserUuidToIp,
} from "../../../../user";

export default async (req: Request, res: Response) => {
  console.info("Entering POST /api/v1/users/anon", req.body);
  try {
    // find or create
    // we can store in users table but probably not for this time until we have a real user
    const { ip } = req.body;

    if (!ip) {
      console.error(`ip is required`);
      return res.status(422).json({ error: "Missign required ip field" });
    }

    const userUuid = await findUserUuidByIp(ip);

    // user exists do nothing
    if (userUuid) {
      console.info("User with that IP address already exists. Setting cookie either way");

      res.cookie("anonUser", ip, cookieOptions);

      return res.status(204).send();
    }

    const uuid = v4();

    await saveUserIpToUuid({ ip, uuid });
    await saveUserUuidToIp({ ip, uuid });

    res.cookie("anonUser", ip, cookieOptions);
    res.status(204).send();
  } catch (error: any) {
    console.error(`Internal Server Error: ${error.message}`);
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
