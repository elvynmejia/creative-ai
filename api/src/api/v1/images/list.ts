import { type Request, type Response } from "express";

import admin from "../../../supabase";

export default async (req: Request, res: Response) => {
  console.info("Entering GET /api/v1/videos", req.query);
  try {
    // TODO: add a range for pagination
    const { data, error, count } = await admin
      .from("images")
      .select("*", { count: "exact" })
      .eq("user_id", req?.user?.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
    // .range(page * perPage, page * perPage + perPage - 1);

    if (error) {
        console.error(`Unable to get images. Error ${JSON.stringify(error, null, 2)}`);
        throw new Error("Unable to retreive list of images");
    }

    return res
        .status(200)
        .json({ assets: data || [], total_records: count });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};