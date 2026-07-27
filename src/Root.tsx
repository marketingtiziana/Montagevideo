import React from "react";
import { Composition } from "remotion";
import { EDIT } from "./edit";
import { Short, TOTAL_FRAMES } from "./Short";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Short"
      component={Short}
      durationInFrames={TOTAL_FRAMES}
      fps={EDIT.meta.fps}
      width={EDIT.meta.width}
      height={EDIT.meta.height}
    />
  );
};
