import { NextResponse } from "next/server";
import { allStories } from "@/lib/articles";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(allStories()); }
