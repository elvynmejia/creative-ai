import "./App.css";

import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileInput, Textarea, Button, Divider } from "react-daisyui";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

import Grid from "./components/grid";

const API_URL = import.meta.env.VITE_API_URL;
const SUPABASE_API_URL = import.meta.env.VITE_SUPABASE_API_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_API_URL, SUPABASE_ANON_KEY);

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg"];

const ANON_USER_ID = "ANON_USER_ID";

type Video = {
  id: string;
  status: string;
  image_url: string;
  video_url: string;
};

function App() {
  const sourceFileRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [sourceFile, setSourceFile] = useState<File>();

  useEffect(() => {
    const getVideos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/videos`, {
          params: {
            user_id: localStorage.getItem(ANON_USER_ID),
          },
        });
        setVideos([...response.data.assets]);
      } catch (error: any) {
        console.error(`Something went wrong. Error ${error.response.data}`);
      }
    };

    getVideos();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(ANON_USER_ID)) {
      localStorage.setItem(ANON_USER_ID, uuidv4());
    }
  }, []);

  const callback = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/videos/${id}`);

      setVideos((prev) => {
        return prev.map((vid) => {
          if (vid.id === id) {
            return {
              ...vid,
              ...response.data.video,
            };
          }
          return vid;
        });
      });
    } catch (error) {
      console.error("============= something went wrong here ==============");
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()!;
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
      const response = await axios.post(`${API_URL}/api/v1/videos`, {
        user_id: localStorage.getItem(ANON_USER_ID),
        image_url: publicUrl,
        prompt: prompt,
      });

      setVideos((prev) => {
        return [
          {
            id: response.data.video.id,
            status: response.data.video.status,
            image_url: response.data.video.image_url,
            video_url: "",
          },
          ...prev,
        ];
      });

      reset(undefined);
    } catch (error: any) {
      alert(`An error accurred: ${error.message}. Try again`);
    }
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
    <div className="container">
      <h1 className="text-3xl font-bold">Bring your images to life</h1>
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
      <Divider />
      <Grid items={videos} updateCallback={callback} />
    </div>
  );
}

export default App;
