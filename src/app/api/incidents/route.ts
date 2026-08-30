import { NextResponse } from "next/server";
import { supabase } from "@/lib/ingest";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .order("start_time", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
