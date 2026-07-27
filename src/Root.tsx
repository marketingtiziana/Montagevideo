import React from "react";
import { Composition } from "remotion";
import { GraphicsOnly, GRAPHICS_TOTAL } from "./graphics/GraphicsOnly";
import { Short, TOTAL_FRAMES } from "./Short";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GraphicsOnly"
        component={GraphicsOnly}
        durationInFrames={GRAPHICS_TOTAL}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Short"
        component={Short}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
