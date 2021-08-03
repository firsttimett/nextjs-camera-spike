/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable sonarjs/cognitive-complexity */
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { useAppContext } from "src/components/app-context";
import { Canvas } from "src/components/Canvas";
import { Page, TextButton } from "src/components/common";
import { usePainter } from "src/utils/use-painter-v2";
import styled from "styled-components";

const BlackContainer = styled.div`
  min-height: 88vh;
  background-color: black;
  width: 100%;
  padding: 0 4%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 12% 3% 82% 3%;
`;

const BottomBar = styled.div`
  background-color: white;
  width: 100%;
  padding: 2% 4%;
  justify-content: space-between;
  display: flex;
`;

const TopBar = styled.div`
  align-items: flex-end;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr;

  & button:nth-child(1),
  i:nth-child(1) {
    text-align: left;
  }
  & button:nth-child(2),
  i:nth-child(2) {
    text-align: center;
  }
  & button:nth-child(3),
  i:nth-child(3) {
    text-align: right;
  }
`;

const DownloadIcon = styled.i.attrs({
  className: "fa fa-download",
})`
  color: white;
  font-size: 1.6em;
  cursor: pointer;
`;

const EraserIcon = styled.i.attrs({
  className: "fa fa-eraser",
})`
  font-size: 2em;
`;

const SelectedEraserIcon = styled.i.attrs({
  className: "fa fa-eraser",
})`
  font-size: 2em;
  border: 1px solid black;
  border-radius: 50%;
  overflow: hidden;
`;

const EditIcon = styled.i.attrs({
  className: "fa fa-pencil",
})`
  color: ${(props) => props.color};
  font-size: 1em;
`;

const CanvasContainer = styled.div`
  text-align: center;
  justify-items: center;
  width: 100%;
`;

const ColorSelection = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 9vw);
  grid-column-gap: 4vw;
`;

const Color = styled.div`
  background-color: ${(props) => props.color};
  border: ${(props) => (props.color === "white" ? "1px solid black" : "none")};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
`;

export default function Edit() {
  const canvasRef = useRef<HTMLCanvasElement>();
  const appContext = useAppContext();

  const colors = ["black", "white", "#2e7fce", "#e83323", "#4a902c", "#f9e553"];
  const [selectedColor, setSelectedColor] = useState("#e83323");
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);

  const { init, setIsEraser, changeColor, clearDrawing } = usePainter(
    canvasRef,
    selectedColor
  );

  const colorOnSelect = (color: string) => (_: MouseEvent<HTMLDivElement>) => {
    if (isEraserMode) {
      setIsEraser(false);
      setIsEraserMode(false);
    }

    if (selectedColor === color) {
      return;
    }
    setSelectedColor(color);
    changeColor(color);
  };

  useEffect(() => {
    if (isCanvasLoaded) {
      init();
    }
  }, [init, isCanvasLoaded]);

  const eraserOnClick = (_: MouseEvent) => {
    setIsEraser(true);
    setIsEraserMode(true);
    setSelectedColor("");
  };

  const downloadOnClick = async () => {
    if (!canvasRef.current) {
      return;
    }

    const link = document.createElement("a");
    link.download = "image";

    const img = new Image();
    const ctx = canvasRef.current.getContext("2d");

    img.onload = function () {
      if (!canvasRef.current || !ctx) {
        return;
      }

      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;

      const new_canvas = document.createElement("canvas");
      new_canvas.width = canvasWidth;
      new_canvas.height = canvasHeight;

      const new_ctx = new_canvas.getContext("2d");

      new_ctx?.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      new_ctx?.drawImage(canvasRef.current, 0, 0);

      link.href = new_canvas.toDataURL();
      link.click();
    };

    img.src = appContext.photoPath;
  };

  return (
    <Page>
      <BlackContainer>
        <TopBar>
          <TextButton color="white" onClick={clearDrawing}>
            Clear
          </TextButton>
          <DownloadIcon onClick={downloadOnClick} />
          <TextButton color="white">Done</TextButton>
        </TopBar>
        <div>&nbsp;</div>
        <CanvasContainer>
          <Canvas ref={canvasRef} setIsCanvasLoaded={setIsCanvasLoaded} />
        </CanvasContainer>
        <div>&nbsp;</div>
      </BlackContainer>
      <BottomBar>
        {isEraserMode ? (
          <SelectedEraserIcon />
        ) : (
          <EraserIcon onClick={eraserOnClick} />
        )}
        <ColorSelection>
          {colors.map((color) => (
            <Color key={color} color={color} onClick={colorOnSelect(color)}>
              {selectedColor === color ? (
                <EditIcon color={color === "white" ? "black" : "white"} />
              ) : null}
            </Color>
          ))}
        </ColorSelection>
      </BottomBar>
    </Page>
  );
}
