import { type Request, type Response } from "express";

import admin from "../../../supabase";

export default async (req: Request, res: Response) => {
  console.info("Entering DELETE /api/v1/videos/:id", req.params.id);
  try {
    const id = req.params.id;

    const findResponse = await admin
      .from("images")
      .select("*")
      .eq("id", id)
      .select()
      .single();

    if (findResponse.error) {
      console.error(`Cannot find video by given id: ${id}`);
      return res
        .status(404)
        .json({ error: `Cannot find video by given id: ${id}` });
    }

    const updateResponse = await admin
      .from("images")
      .update({ deleted_at: new Date() })
      .eq("id", id);

    if (updateResponse.error) {
        throw new Error(`Unable to mark video for deletion. ${id}`);
    }

    return res.status(204).send();
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
