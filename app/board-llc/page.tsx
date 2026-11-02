import { Suspense } from "react";
import { Canvas } from "@/components/board/Canvas";
import { board } from "@/data/board";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Canvas data={board} />
    </Suspense>
  );
}
