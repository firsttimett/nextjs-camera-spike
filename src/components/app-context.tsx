import React, { createContext, ReactChild, useContext, useReducer } from "react";

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export interface AppContextProps {
  children: ReactChild | ReactChild[];
}

export interface AppState {
  photoPath: string;
}

export type AppActionType = "SET_PHOTO_PATH" | "REMOVE_PHOTO_PATH";

export interface AppAction {
  type: AppActionType;
  payload?: AppState;
}

export const InitialAppState: AppState = {
  photoPath: "",
};

export const AppContext = createContext<AppContextType>({
  state: InitialAppState,
  dispatch: () => null,
});

export const appReducer = (state: AppState, action: AppAction) => {
  switch (action.type) {
    case "SET_PHOTO_PATH":
      if (action.payload?.photoPath) {
        return {
          ...state,
          photoPath: action.payload?.photoPath,
        };
      }
      return state;
    case "REMOVE_PHOTO_PATH":
      return {
        ...state,
        photoPath: "",
      };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

export const AppContextProvider = (props: AppContextProps) => {
  const { children } = props;
  const [appState, appDispatch] = useReducer(appReducer, InitialAppState);

  return (
    <AppContext.Provider value={{ state: appState, dispatch: appDispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const appContext = useContext(AppContext);

  const setPhoto = (photoPath: string) => {
    appContext.dispatch({
      type: "SET_PHOTO_PATH",
      payload: {
        photoPath,
      },
    });
  };

  const removePhoto = () => {
    appContext.dispatch({ type: "REMOVE_PHOTO_PATH" });
  };

  const photoPath = appContext.state.photoPath;

  return {
    setPhoto,
    removePhoto,
    photoPath,
  };
};
