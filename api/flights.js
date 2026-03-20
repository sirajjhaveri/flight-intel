export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const {
    origin,
    destination,
    date,
    returnDate,
    adults = 1,
    children = 0,
    infants = 0,
    cabin = 1, // 1=economy, 2=premium, 3=business, 4=first
    stops = 0, // 0=nonstop only, 1=1 stop, 2=any
  } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "Missing required params: origin, destination, date" });
  }

  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  if (!SERPAPI_KEY) {
    return res.status(500).json({ error: "SERPAPI_KEY not configured" });
  }

  try {
    // Build SerpApi Google Flights URL
    const params = new URLSearchParams({
      engine: "google_flights",
      departure_id: origin,
      arrival_id: destination,
      outbound_date: date,
      type: returnDate ? "1" : "2", // 1=round trip, 2=one way
      travel_class: String(cabin),
      adults: String(adults),
      stops: String(stops),
      currency: "USD",
      hl: "en",
      gl: "us",
      api_key: SERPAPI_KEY,
    });

    if (returnDate) params.set("return_date", returnDate);
    if (parseInt(children) > 0) params.set("children", String(children));
    if (parseInt(infants) > 0) params.set("infants_in_seat", String(infants));

    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    // Parse the flights into a clean format — ONLY nonstop
    const bestFlights = (data.best_flights || []).map((f) => parseFlightGroup(f, "best")).filter(f => f.isDirect);
    const otherFlights = (data.other_flights || []).map((f) => parseFlightGroup(f, "other")).filter(f => f.isDirect);
    const allFlights = [...bestFlights, ...otherFlights];

    // Price insights if available
    const priceInsights = data.price_insights || null;

    return res.status(200).json({
      flights: allFlights,
      priceInsights,
      searchInfo: {
        origin,
        destination,
        date,
        returnDate: returnDate || null,
        adults: parseInt(adults),
        children: parseInt(children),
        infants: parseInt(infants),
        totalResults: allFlights.length,
      },
    });
  } catch (err) {
    console.error("SerpApi error:", err);
    return res.status(500).json({ error: "Failed to fetch flights", details: err.message });
  }
}

function parseFlightGroup(group, tier) {
  const flights = group.flights || [];
  const firstLeg = flights[0] || {};
  const lastLeg = flights[flights.length - 1] || {};

  // Only include nonstop (single leg) flights
  const isDirect = flights.length === 1;

  const airline = firstLeg.airline || "Unknown";
  const airlineCode = firstLeg.airline
    ? firstLeg.airline.substring(0, 2).toUpperCase()
    : "??";
  const flightNumber = firstLeg.flight_number || "";
  const airplane = firstLeg.airplane || "";

  const departure = firstLeg.departure_airport || {};
  const arrival = lastLeg.arrival_airport || {};

  const totalDuration = group.total_duration || 0;
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;

  // Carbon emissions
  const carbon = group.carbon_emissions || {};

  // Layovers
  const layovers = group.layovers || [];

  // Extensions (like baggage, legroom info)
  const extensions = firstLeg.extensions || [];

  return {
    tier, // "best" or "other"
    isDirect,
    airline,
    airlineCode: firstLeg.airline_logo ? undefined : airlineCode,
    airlineLogo: firstLeg.airline_logo || null,
    flightNumber: flightNumber ? `${flightNumber}` : "",
    airplane,
    departure: {
      airport: departure.name || "",
      code: departure.id || "",
      time: departure.time || "",
    },
    arrival: {
      airport: arrival.name || "",
      code: arrival.id || "",
      time: arrival.time || "",
    },
    duration: totalDuration,
    durationStr: `${hours}h ${mins}m`,
    stops: flights.length - 1,
    layovers: layovers.map((l) => ({
      airport: l.name || "",
      code: l.id || "",
      duration: l.duration || 0,
    })),
    price: group.price || 0,
    type: group.type || "",
    carbon: {
      emissions: carbon.this_flight || 0,
      difference: carbon.difference_percent || 0,
    },
    extensions,
    legs: flights.map((leg) => ({
      airline: leg.airline || "",
      flightNumber: leg.flight_number || "",
      airplane: leg.airplane || "",
      departure: {
        airport: (leg.departure_airport || {}).name || "",
        code: (leg.departure_airport || {}).id || "",
        time: (leg.departure_airport || {}).time || "",
      },
      arrival: {
        airport: (leg.arrival_airport || {}).name || "",
        code: (leg.arrival_airport || {}).id || "",
        time: (leg.arrival_airport || {}).time || "",
      },
      duration: leg.duration || 0,
      extensions: leg.extensions || [],
      legroom: leg.legroom || "",
      wifi: (leg.extensions || []).some((e) => e.toLowerCase().includes("wi-fi")),
      power: (leg.extensions || []).some((e) => e.toLowerCase().includes("power") || e.toLowerCase().includes("usb")),
      entertainment: (leg.extensions || []).some((e) => e.toLowerCase().includes("stream") || e.toLowerCase().includes("demand") || e.toLowerCase().includes("entertainment")),
    })),
  };
}
