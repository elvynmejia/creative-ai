import { CookieOptions } from "express";

import { save, get } from "../src/redis";

// would expire 1 year from now in milliseconds
const COOKIE_MAX_AGE_EXPIRATION = Date.now() + 365 * 24 * 60 * 60;

const COOKIE_DEFAULT_OPTIONS = {
  maxAge: COOKIE_MAX_AGE_EXPIRATION,
  httpOnly: true,
  path: "/",
};

export const cookieOptions: CookieOptions = {
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

const expirationInSeconds = Math.floor(
  (Date.now() + 365 * 24 * 60 * 60) / 1000,
);

export const findUserUuidByIp = async (ip: string) => {
  return get(`anon_user_ip_to_uuid:${ip}`);
};

export const findUserIpByUuid = async (uuid: string) => {
  return get(`anon_user_uuid_to_ip:${uuid}`);
};

type AnonUser = {
  ip: string;
  uuid: string
};

export const saveUserUuidToIp = async ({ ip, uuid }: AnonUser) => {
  return save(`anon_user_ip_to_uuid:${ip}`, uuid, expirationInSeconds);
};

export const saveUserIpToUuid = async ({ ip, uuid }: AnonUser) => {
  return save(`anon_user_uuid_to_ip:${uuid}`, ip, expirationInSeconds);
};
