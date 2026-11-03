import { Suspense } from "react";
import { Canvas } from "@/components/excalidraw/Canvas";
import { board } from "@/data/excalidraw";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Canvas data={board} />
    </Suspense>
  );
}
