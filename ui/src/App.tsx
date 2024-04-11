import "./App.css";

import { useReducer } from "react";
import { Divider } from "react-daisyui";

import { useUser } from "./hooks/useCurrenUser";
import { AssetsContext, AssetsDispatchContext } from "./context/assets";
import { initialState, reducer } from "./context/assets";

import AssetsList from "./components/assets/assets";
import AddAsset from "./components/assets/addAsset";

function App() {
  const [assets, dispatch] = useReducer(reducer, initialState);

  useUser();

  return (
    <AssetsContext.Provider value={assets}>
      <AssetsDispatchContext.Provider value={dispatch}>
        <div className="container">
          <div className="flex flex-col space-y-1">
            <h1 className="text-3xl font-bold">Bring your images to life</h1>
            <h1 className="text">Turn your images into videos</h1>
          </div>
          <AddAsset />
          <Divider />
          <AssetsList />
        </div>
      </AssetsDispatchContext.Provider>
    </AssetsContext.Provider>
  );
}

export default App;
