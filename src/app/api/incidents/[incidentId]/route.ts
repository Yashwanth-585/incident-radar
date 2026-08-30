import { NextResponse } from "next/server";
import { supabase } from "@/lib/ingest";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await params;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("incident_id", incidentId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
