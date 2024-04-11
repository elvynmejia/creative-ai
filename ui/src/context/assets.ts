import { createContext } from "react";

export const ASSETS_ACTIONS = {
  ADD_MANY: "ADD_MANY",
  DELETE: "DELETE",
  ADD: "ADD",
  UPDATE: "UPDATE"
};

export type Asset = {
  id: string;
  status: string;
  image_url: string;
  video_url: string;
};

export const initialState: Asset[] = [];

export const reducer = (assets: Asset[], action: any) => {
  const { type } = action;
  switch (type) {
    case ASSETS_ACTIONS.DELETE:
      return assets.filter((a) => a.id !== action.id);
    case ASSETS_ACTIONS.ADD_MANY:
      return action.assets || [];
    case ASSETS_ACTIONS.ADD:
      return [
        action.asset,
        ...assets,
      ];
    case ASSETS_ACTIONS.UPDATE:
      return assets.map(asset => {
        if (asset.id === action.id) {
          return {
            ...asset,
            ...action.asset
          }
        }

        return asset;
      })
    default:
      return assets;
  }
};

export const AssetsContext = createContext(initialState);
export const AssetsDispatchContext = createContext((...args: any) => console.log(...args));
