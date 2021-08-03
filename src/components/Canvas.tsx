import React, { Dispatch, forwardRef, SetStateAction, useEffect } from "react";
import { calculateAspectRatioFit } from "src/utils/img-helper";
import { useAppContext } from "./app-context";

interface CanvasProps {
  setIsCanvasLoaded?: Dispatch<SetStateAction<boolean>>;
}

export const Canvas = forwardRef((props: CanvasProps, ref: any) => {
  const appContext = useAppContext();
  const photoPath = appContext.photoPath;

  useEffect(() => {
    const img = new Image();

    img.onload = function () {
      const ctx = ref?.current?.getContext("2d");
      if (!ref || !ref.current || !ctx) {
        return;
      }

      const { width, height } = calculateAspectRatioFit(
        img.width,
        img.height,
        ref.current.parentElement.clientWidth,
        ref.current.parentElement.clientHeight
      );

      ref.current.style.backgroundImage = `url("${photoPath}")`;
      ref.current.style.backgroundPosition = "center";
      ref.current.style.backgroundSize = "contain";
      ref.current.style.backgroundRepeat = "no-repeat";

      // Setting width and height here to prevent user to draw outside of the image
      ref.current.width = width;
      ref.current.height = height;

      props.setIsCanvasLoaded?.(true);
    };

    img.src = photoPath;
  }, [photoPath, ref]);

  return <canvas id="canvas" ref={ref as any} />;
});
