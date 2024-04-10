import { type Request, type Response } from "express";

import admin from "../../../supabase";

export default async (req: Request, res: Response) => {
  console.info("Entering GET /api/v1/videos", req.query);
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res
        .status(422)
        .json({ error: `user_id is required: given user_id: ${user_id}` });
    }

    // TODO: check user id against users

    // TODO: add a range for pagination
    const { data, error, count } = await admin
      .from("images")
      .select("*", { count: "exact" })
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    // .range(page * perPage, page * perPage + perPage - 1);

    if (error) {
        console.error(`Unable to get images. Error ${JSON.stringify(error, null, 2)}`);
        return res
            .status(500)
            .json({ images: "Internal Server Error: Unable to retreive images" });
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