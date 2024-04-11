import { useState, useRef, useContext } from "react";
import { Textarea, FileInput, Button } from "react-daisyui";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

import {
  axiosClient,
  SUPABASE_API_URL,
  SUPABASE_ANON_KEY,
  ALLOWED_IMAGE_EXTENSIONS,
} from "../../utils";

import { AssetsDispatchContext, ASSETS_ACTIONS } from "../../context/assets";

const supabase = createClient(SUPABASE_API_URL, SUPABASE_ANON_KEY);

export default function () {
  const dispatch = useContext(AssetsDispatchContext);

  const sourceFileRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [sourceFile, setSourceFile] = useState<File>();

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()!;
  };

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPrompt(event.target.value);
  };

  const create = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (prompt === "" || sourceFile === undefined) {
      alert(
        "Unable to generate video. Please describe the scene and upload a source image",
      );
      return;
    }

    const fileId = uuidv4();

    const fileExt = getFileExtension(sourceFile.name);

    const fileName = `${fileId}.${fileExt}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, sourceFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert("Unable to uplaod video. Please try again.");
      return;
    }

    const publicUrlResponse = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    const { publicUrl } = publicUrlResponse.data;

    try {
      const response = await axiosClient.post(`/api/v1/videos`, {
        image_url: publicUrl,
        prompt: prompt,
      });

      dispatch({
        type: ASSETS_ACTIONS.ADD,
        asset: {
          id: response.data.video.id,
          status: response.data.video.status,
          image_url: response.data.video.image_url,
          video_url: "",
        },
      });

      reset(undefined);
    } catch (error: any) {
      alert(`An error accurred: ${error.message}. Try again`);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files) {
      const image = event.target.files[0];
      const fileExt = getFileExtension(image.name);

      if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExt)) {
        alert(
          `Invalid file type. ${ALLOWED_IMAGE_EXTENSIONS.join(",")}. Given ${fileExt}`,
        );
        event.target.value = "";
        return;
      }

      setSourceFile(image);
      return;
    }

    alert("Please provide a source image. Try again.");
  };

  const reset = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    if (event) {
      event.preventDefault();
    }

    if (prompt === "" || sourceFile === undefined) {
      return;
    }

    if (sourceFileRef.current) {
      sourceFileRef.current.value = "";
    }

    setPrompt("");
    setSourceFile(undefined);
  };
  return (
    <div className="py-10">
      <div className="flex flex-col justify-center space-y-2">
        <div className="flex flex-col space-y-2">
          <p className="text-1xl">
            Describe the desired scene you would like to see
          </p>
          <Textarea
            ref={sourceFileRef}
            placeholder="A busy cyberpunk street"
            size="sm"
            onChange={handlePromptChange}
            value={prompt}
          />
        </div>
        <FileInput onChange={handleUpload} />
        <div className="flex flex-row gap-x-10 w-full justify-center">
          <Button color="primary" onClick={create}>
            Create
          </Button>
          <Button color="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
