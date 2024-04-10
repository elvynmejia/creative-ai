import { type Request, type Response } from "express";

import axios from "axios";
import { v4 } from "uuid";

import supabase from "../../../supabase";
import { save } from "../../../redis";

const proccesVideo = async ({
  outputVideoUrl,
  inputImageUrl,
}: {
  outputVideoUrl: string;
  inputImageUrl: string;
}) => {
  try {
    console.info("Processing video", {
      outputVideoUrl,
      inputImageUrl,
    });

    const response = await axios.get(outputVideoUrl, {
      responseType: "arraybuffer",
    });

    const fileName = v4();

    const uploadResponse = await supabase.storage
      .from("videos") // store to video storage
      .upload(fileName, response.data, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadResponse.error) {
      console.error(
        `Error uploading output video. ${uploadResponse.error.message}`,
      );
    }

    const publicUrlResponse = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    const { publicUrl } = publicUrlResponse.data;

    const { error } = await supabase
      .from("images")
      .update({ video_url: publicUrl, status: "completed" })
      .eq("image_url", inputImageUrl);

    if (error) {
      console.error("Error saving resulting video video_url to images", {
        inputImageUrl,
        outputVideoUrl,
        error,
      });
    }

    await save(
      `video_generation_status_by_image_url:${inputImageUrl}`,
      "completed",
    );
  } catch (error: any) {
    console.error(`Error processing video`, {
      inputImageUrl,
      outputVideoUrl,
      error: JSON.stringify(error, null, 2),
    });
    throw new Error(`Error processing image2Video. ${error.message}`);
  }
};

export default async (req: Request, res: Response) => {
  console.info("Entering POST /api/v1/webhooks/videos", req.body);
  try {
    const { status, input, output } = req.body;

    if (status === "succeeded") {
      await proccesVideo({
        inputImageUrl: input.image,
        outputVideoUrl: output,
      });
    }

    return res.status(200).json({});
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};
