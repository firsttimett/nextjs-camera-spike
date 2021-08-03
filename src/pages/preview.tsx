import { useRouter } from "next/router";
import React, { useRef } from "react";
import { useAppContext } from "src/components/app-context";
import { Canvas } from "src/components/Canvas";
import { Page, TextButton } from "src/components/common";
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

const PreviewSelection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 45px);
  grid-column-gap: 25px;
  height: 100%;
`;

const ImagePreviewItem = styled.canvas`
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
  outline: 1px dotted black;
  width: 45px;
  height: 45px;
`;

const TopBar = styled.div`
  align-items: flex-end;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;

  & div:nth-child(1) {
    text-align: left;
  }
  & div:nth-child(2) {
    text-align: center;
  }
  & div:nth-child(3) {
    text-align: right;
  }
`;

const BackContainer = styled.div`
  cursor: pointer;
`;

const BackIcon = styled.i.attrs({
  className: "fa fa-arrow-left",
})`
  color: white;
  font-size: 1.6em;
`;

const CameraIcon = styled.i.attrs({
  className: "fa fa-camera",
})`
  color: white;
  margin-left: 2vw;
  font-size: 1.6em;
`;

const TrashIcon = styled.i.attrs({
  className: "fa fa-trash",
})`
  color: white;
  font-size: 1.6em;
  cursor: pointer;
  margin-right: 1.2em;
`;

const DownloadIcon = styled.i.attrs({
  className: "fa fa-download",
})`
  color: white;
  font-size: 1.6em;
  cursor: pointer;
`;

const EditIcon = styled.i.attrs({
  className: "fa fa-pencil",
})`
  color: white;
  font-size: 1.6em;
  cursor: pointer;
`;

const CanvasContainer = styled.div`
  //   overflow: hidden;
  text-align: center;
  width: 100%;
  height: 100%;
`;

export default function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>();
  const router = useRouter();
  const appContext = useAppContext();

  const editIconOnClick = () => {
    router.push("/edit");
  };

  const backOnClick = () => {
    router.back();
  };

  const downloadOnClick = () => {
    const link = document.createElement("a");
    link.download = "image";
    link.href = appContext.photoPath;
    link.click();
  };

  return (
    <Page>
      <BlackContainer>
        <TopBar>
          <BackContainer onClick={backOnClick}>
            <BackIcon />
            <CameraIcon />
          </BackContainer>
          <div>
            <DownloadIcon onClick={downloadOnClick} />
          </div>
          <div>
            <TrashIcon />
            <EditIcon onClick={editIconOnClick} />
          </div>
        </TopBar>
        <div>&nbsp;</div>
        <CanvasContainer>
          <Canvas ref={canvasRef} />
        </CanvasContainer>
        <div>&nbsp;</div>
      </BlackContainer>
      <BottomBar>
        <PreviewSelection>
          <ImagePreviewItem />
          <ImagePreviewItem />
          <ImagePreviewItem />
        </PreviewSelection>
        <TextButton>Clear</TextButton>
      </BottomBar>
    </Page>
  );
}
