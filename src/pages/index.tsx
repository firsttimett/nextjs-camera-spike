import { useRouter } from "next/router";
import React, { ChangeEvent, useRef } from "react";
import styled from "styled-components";
import { useAppContext } from "src/components/app-context";
import { Page } from "src/components/common";

const DragAndDropContainer = styled.div`
  border: 2px dashed #0068d7;
  border-radius: 10px;
  width: 70vh;
  margin: 20px 10px;
  height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #0068d705;

  @media (max-width: 600px) {
    width: 95%;
    height: 300px;
  }
`;

const CameraIcon = styled.i.attrs({
  className: "fa fa-camera",
})`
  color: #0068d7;
  font-size: 3em;
`;

const ActionTitle = styled.h3`
  color: #0068d7;
`;

const ActionDescription = styled.h3`
  color: #777373;
`;

const HiddenInput = styled.input`
  opacity: 0;
`;

export default function Home() {
  const inputRef = useRef<HTMLInputElement>();
  const appContext = useAppContext();
  const router = useRouter();

  function onImageCaptureHandler(e: ChangeEvent<HTMLInputElement | undefined>) {
    // stop input to trigger again
    e.preventDefault();
    const image = e?.target?.files?.[0];
    if (image) {
      const photoPath = URL.createObjectURL(image);

      appContext.setPhoto(photoPath);
      router.push("/preview");
    }
  }

  const containerOnClick = () => {
    inputRef?.current?.click();
  };

  return (
    <Page>
      <DragAndDropContainer onClick={containerOnClick}>
        <HiddenInput
          type="file"
          accept="image/*"
          ref={inputRef as any}
          onChange={onImageCaptureHandler}
        />
        <CameraIcon />
        <ActionTitle>Add Photos</ActionTitle>
        <ActionDescription>Maximum 3 photos</ActionDescription>
      </DragAndDropContainer>
    </Page>
  );
}
