import { useRef, useEffect } from "react";
import { Card, Loading, Button } from "react-daisyui";
import usePolling from "../hooks/useStatus";

type UpdateCallback = (id: string) => Promise<void>;
type OnDeleteCallback = (id: string) => Promise<void>;

export default function Grid({
  items,
  updateCallback,
  onVideoDelete
}: {
  items: any[];
  updateCallback: UpdateCallback;
  onVideoDelete: OnDeleteCallback;
}) {
  return (
    <div>
      {items.length > 0 ? (
        <div className="flex justify-center flex-row gap-x-10 grid grid-cols-4 gap-4">
          {items.map((item) => {
            return (
              <GridItem
                key={item.id}
                item={item}
                updateCallback={updateCallback}
                onVideoDelete={onVideoDelete}
              />
            );
          })}
        </div>
      ) : (
        <p className="flex justify-center">You have no videos yet.</p>
      )}
    </div>
  );
}

const GridItem = ({
  item,
  updateCallback,
  onVideoDelete,
}: {
  item: any;
  updateCallback: UpdateCallback;
  onVideoDelete: OnDeleteCallback;
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
          style={{ width: "100%", height: "100%" }}
        >
          <p>Generating video</p>
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
          <video ref={videoRef} controls autoPlay loop>
            <source src={item?.video_url} />
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
    if (
      confirm("Are you sure you want to delete this video?")
    ) {
      await onVideoDelete(id);
    }
  };

  return (
    <Card className="flex flex-col p-2 bordered">
      <img src={item?.image_url} alt="uploaded picture" />
      {getVideoContainer()}
      <Card.Actions className="justify-end mt-5">
        <Button color="neutral" size="sm" onClick={(e) => onDelete(e, item.id)}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
};
