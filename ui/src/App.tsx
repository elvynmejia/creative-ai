import "./App.css";

import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileInput, Card, Loading, Textarea } from "react-daisyui";
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
  const [prompt, setPrompt] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);

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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (prompt === "") {
      alert("Please describe the scene you want based on the provided image");
      event.target.value = "";
      return;
    }

    if (event.target.files) {
      const image = event.target.files[0];
      const fileExt = image.name.split(".").pop()!;

      if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExt)) {
        alert(
          `Invalid file type. ${ALLOWED_IMAGE_EXTENSIONS.join(",")}. Given ${fileExt}`,
        );
        event.target.value = "";
        return;
      }

      const fileId = uuidv4();

      const fileName = `${fileId}.${fileExt}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        alert("Unable to uplaod video. Please try again.");
        event.target.value = "";
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
      } catch (error: any) {
        event.target.value = "";
        alert(`An error accurred: ${error.message}. Try again`);
      }
    }
  };

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPrompt(event.target.value);
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
              placeholder="A busy cyberpunk street"
              size="lg"
              onChange={handlePromptChange}
              value={prompt}
            />
          </div>
          <FileInput onChange={handleUpload} />
        </div>
      </div>
      <Grid items={videos} updateCallback={callback} />
    </div>
  );
}

export default App;
