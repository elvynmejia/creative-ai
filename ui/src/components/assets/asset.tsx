import { useContext, useEffect, useRef } from "react";
import { Loading, Card, Button } from "react-daisyui";

import usePolling from "../../hooks/useStatus";
import { axiosClient } from "../../utils";

import {
  ASSETS_ACTIONS,
  Asset,
  AssetsDispatchContext 
} from "../../context/assets";

export default function ({ asset }: { asset: Asset }) {
  const dispatch = useContext(AssetsDispatchContext);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.src !== asset.video_url) {
      videoRef.current.src = asset.video_url;
      videoRef.current.load();
    }
  }, [asset.video_url, asset?.id]);

  const callback = async (id: string) => {
    try {
      const response = await axiosClient.get(`/api/v1/videos/${id}`);
      dispatch({
        type: ASSETS_ACTIONS.UPDATE,
        id: asset.id,
        asset: {
          ...response.data.video,
        },
      });
    } catch (error) {
      alert("Something went wrong. Try refreshing this page.");
    }
  };

  const shouldPoll = asset?.status === "enqueued";

  const pollingState = usePolling(asset?.id || "", shouldPoll, callback);

  const { isPolling } = pollingState;

  const showVideoPlaceHolder = shouldPoll && isPolling;

  const getVideoContainer = () => {
    if (showVideoPlaceHolder) {
      return (
        <div
          className="flex items-center flex-col justify-center spacy-y-2"
          style={{ width: "100%", height: "100%" }}
        >
          <p>Generating video</p>
          <Loading />
          <p>This will take awhile</p>
        </div>
      );
    } else if (asset.video_url !== "") {
      return (
        <div
          className="flex items-center"
          style={{ width: "100%", height: "100%" }}
        >
          <video ref={videoRef} controls autoPlay loop>
            <source src={asset?.video_url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  const onDelete = async (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    event.preventDefault();
    if (confirm("Are you sure you want to delete this video?")) {
      try {
        await axiosClient.delete(`/api/v1/videos/${id}`);
        dispatch({
          type: ASSETS_ACTIONS.DELETE,
          id,
        });
      } catch (error: any) {
        alert(`An error accurred: ${error.message}. Try again`);
      }
    }
  };

  return (
    <Card className="flex flex-col p-2 bordered">
      <img src={asset?.image_url} alt="uploaded picture" />
      {getVideoContainer()}
      <Card.Actions className="justify-end mt-5">
        <Button
          disabled={asset.status !== "completed"}
          color="neutral"
          size="sm"
          onClick={(e) => onDelete(e, asset.id)}
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}
