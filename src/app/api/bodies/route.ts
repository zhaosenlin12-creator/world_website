import { NextResponse } from "next/server";
import { BODIES, BELT, KUIPER, OORT, SUN } from "@/data/bodies";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ sun: SUN, planets: BODIES.filter((b)=>b.kind==="planet"), dwarfs: BODIES.filter((b)=>b.kind==="dwarf"), belt: BELT, kuiper: KUIPER, oort: OORT });
}
