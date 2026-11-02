import { Canvas } from "@/components/board/Canvas";
import { board } from "@/data/board";

export default function Page() {
  return <Canvas data={board} />;
}
