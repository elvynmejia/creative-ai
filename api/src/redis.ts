import { Redis } from "@upstash/redis";

const redis =  new Redis({
    url: process.env.REDIS_URL!,
    token: process.env.REDIS_API_KEY!
});

export const save = async (key: string, value: string, exp?: number) => {
    // expires 24 from now
    const expirationInSeconds = exp || Math.floor(
        (Date.now() + (24 * 60 * 60)) / 1000
    );

    return redis.set(key, value, { ex: expirationInSeconds });
};

export const get = async (key: string): Promise<string | null> => {
    const status: string = (await redis.get(key)) as unknown as string;
    return status ? status : null;
};

export default redis;