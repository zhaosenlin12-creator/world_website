import { Explorer } from "@/components/Explorer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Explorer — Cosmos",
  description: "Spin the camera, click any planet, follow the orbits. A live, in-browser 3D simulation of our solar system."
};

export default function ExplorePage() {
  return <Explorer />;
}
