import { NextResponse } from "next/server";
import { supabase } from "@/lib/ingest";

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service");
  const source = searchParams.get("source");
  const severity = searchParams.get("severity");
  const search = searchParams.get("search");
  const incidentId = searchParams.get("incidentId");

  try {
    if (incidentId) {
      // Query events correlated with this incident via junction table
      const { data: links, error: linkErr } = await supabase
        .from("incident_events")
        .select("event_id")
        .eq("incident_id", incidentId);

      if (linkErr) {
        return NextResponse.json({ error: linkErr.message }, { status: 500 });
      }

      const eventIds = (links ?? []).map((l: any) => l.event_id);
      if (eventIds.length === 0) {
        return NextResponse.json([]);
      }

      let query = supabase
        .from("operational_events")
        .select("*")
        .in("event_id", eventIds)
        .order("timestamp", { ascending: true });

      const { data, error } = await query;
      if (error) {
        // Fallback to events table if not in operational_events
        const fallback = await supabase
          .from("events")
          .select("*")
          .in("event_id", eventIds)
          .order("timestamp", { ascending: true });
        return NextResponse.json(fallback.data ?? []);
      }
      return NextResponse.json(data ?? []);
    }

    // Default: fetch all raw operational events from operational_events table
    let query = supabase
      .from("operational_events")
      .select("*")
      .order("timestamp", { ascending: false });

    if (service && service !== "all") {
      query = query.eq("service", service);
    }
    if (source && source !== "all") {
      query = query.eq("source", source);
    }
    if (severity && severity !== "all") {
      query = query.eq("severity", severity);
    }
    if (search) {
      query = query.or(
        `message.ilike.%${search}%,service.ilike.%${search}%,source.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
