import { CookieOptions, type Request, type Response } from "express";

import { v4 } from "uuid";
// import { createImageToVideo } from "../../../../replicate";

// import admin from "../../../../supabase";
import { save, get } from "../../../../redis";

// would expire 1 year from now in milliseconds
const COOKIE_MAX_AGE_EXPIRATION = Date.now() + 365 * 24 * 60 * 60;

const COOKIE_DEFAULT_OPTIONS = {
  maxAge: COOKIE_MAX_AGE_EXPIRATION,
  httpOnly: true,
  path: "/",
};

const cookieOptions: CookieOptions = {
  ...(process.env.NODE_ENV === "production"
    ? {
        secure: true,
        sameSite: "none",
        ...COOKIE_DEFAULT_OPTIONS,
      }
    : {
        domain: "localhost",
        secure: false,
        sameSite: "lax",
        ...COOKIE_DEFAULT_OPTIONS,
      }),
};

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

    const anonIpToUuid = `anon_user_ip_to_uuid:${ip}`;

    const anonUuid = await get(anonIpToUuid);

    // if (anonUuid) {
    //   return res.status(200).json({ user: { anon_uuid: anonIpToUuid } });
    // }

    // expire 1 year into the future
    const expirationInSeconds = Math.floor(
      (Date.now() + 365 * 24 * 60 * 60) / 1000,
    );

    const uuid = v4();

    await save(anonIpToUuid, uuid, expirationInSeconds);
    res.cookie("anonUser", uuid, cookieOptions);
    // res.status(201).json({ user: { anon_uuid: uuid } });
    res.send();
  } catch (error: any) {
    console.error(`Internal Server Error: ${error.message}`);
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
