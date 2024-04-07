import { useRef, useEffect } from "react";
import { Card, Loading } from "react-daisyui";
import usePolling from "../hooks/useStatus";

type UpdateCallback = (id: string) => Promise<void>;

export default function Grid({
  items,
  updateCallback,
}: {
  items: any[];
  updateCallback: UpdateCallback;
}) {
  return (
    <div className="flex justify-center flex-row gap-x-10">
      {items.map((item) => {
        return (
          <GridItem key={item.id} item={item} updateCallback={updateCallback} />
        );
      })}
    </div>
  );
}

const GridItem = ({
  item,
  updateCallback,
}: {
  item: any;
  updateCallback: UpdateCallback;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.src !== item.video_url) {
      videoRef.current.src = item.video_url;
      videoRef.current.load();
    }
  }, [item.video_url, item?.id]);

  const shouldPoll =
    (item?.id !== "" && item?.status === undefined) ||
    item?.status === null ||
    item?.status === "" ||
    item?.status === "enqueued" ||
    item?.status !== "error";

  const pollingState = usePolling(item?.id || "", shouldPoll, updateCallback);

  const { isPolling } = pollingState;

  const showVideoPlaceHolder = shouldPoll && isPolling;

  const getVideoContainer = () => {
    if (showVideoPlaceHolder) {
      return (
        <div
          className="flex items-center flex-col justify-center spacy-y-2"
          style={{ width: 320, height: "100%" }}
        >
          <p>
            Generating video 
          </p>
          <Loading /> 
          <p>This will take awhile</p>
        </div>
      );
    } else if (item.video_url !== "") {
      return (
        <div
          className="flex items-center"
          style={{ width: "100%", height: "100%" }}
        >
          <video
            ref={videoRef}
            width="200px"
            height="200px"
            controls
            autoPlay
            loop
          >
            <source src={item?.video_url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="flex flex-row p-2 bordered">
      <img
        src={item?.image_url}
        alt="uploaded picture"
        width="200px"
        height="200px"
      />
      {getVideoContainer()}
    </Card>
  );
};
