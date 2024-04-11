import { useEffect, useContext } from "react";
import AssetItem from "./asset";
import { Asset, ASSETS_ACTIONS, AssetsContext, AssetsDispatchContext } from "../../context/assets";
import { axiosClient } from "../../utils";

export default function AssetsList() {

  const assets = useContext(AssetsContext);
  const dispatch = useContext(AssetsDispatchContext);

  useEffect(() => {
    const getVideos = async () => {
      try {
        const response = await axiosClient.get(`/api/v1/videos`);
        dispatch({
          type: ASSETS_ACTIONS.ADD_MANY,
          assets: response.data.assets,
        });
      } catch (error: any) {
        console.error(`Something went wrong. Error ${error.response.data}`);
      }
    };

    getVideos();
  }, []);

  return (
    <div>
      {assets.length > 0 ? (
        <div className="flex justify-center flex-row gap-x-10 grid grid-cols-4 gap-4">
          {assets.map((asset: Asset) => {
            return <AssetItem key={asset.id} asset={asset} />;
          })}
        </div>
      ) : (
        <p className="flex justify-center">You have no videos yet.</p>
      )}
    </div>
  );
}
