/**
 * Curated external YouTube video references for specific PPL topics.
 * These supplement the MIT 16.687 lectures for topics not well covered there.
 */
export interface ExternalVideo {
  videoId: string;
  title: string;
  channel: string;
  topics: string[];
  startTime?: number;
}

export const EXTERNAL_VIDEOS: ExternalVideo[] = [
  // Carburetor Ice
  { videoId: "gQxhM8p0YtY", title: "Carburetor Ice Explained", channel: "Boldmethod", topics: ["carburetor", "carb", "carburetor ice", "carburetor heat", "icing"], startTime: 0 },
  { videoId: "VxWjLkMmE0g", title: "Carburetor Icing - How to Recognize and Prevent It", channel: "Aircraft Systems", topics: ["carburetor", "ice", "carburetor heat", "rpm"], startTime: 0 },

  // Stalls
  { videoId: "zPdF8n7jR1k", title: "Stall Awareness - What Every Pilot Must Know", channel: "FlightChops", topics: ["stall", "stalls", "stall warning", "angle of attack", "stall recognition"], startTime: 0 },
  { videoId: "X6y1FbCnS5Q", title: "Power-On Stalls vs Power-Off Stalls", channel: "MzeroA Flight Training", topics: ["stall", "power-on stall", "power-off stall", "departure stall", "approach stall"], startTime: 0 },

  // Weather / METAR / TAF
  { videoId: "dDv8wIH9fR0", title: "How to Read a METAR - Aviation Weather", channel: "Flight Insight", topics: ["metar", "weather report", "weather observation", "aviation weather"], startTime: 0 },
  { videoId: "8gE3gVzrNzQ", title: "How to Read a TAF", channel: "Flight Insight", topics: ["taf", "weather forecast", "terminal aerodrome forecast"], startTime: 0 },

  // Airspace
  { videoId: "L4K7V4L3dD0", title: "US Airspace Explained", channel: "Flight Insight", topics: ["airspace", "class b", "class c", "class d", "class e", "class g", "class a"], startTime: 0 },

  // Weight and Balance
  { videoId: "V0dGpPdWn6M", title: "Weight and Balance Made Easy", channel: "FlightInsight", topics: ["weight and balance", "center of gravity", "cg", "moment", "loading"], startTime: 0 },

  // Density Altitude
  { videoId: "hBwBZpG5W9Y", title: "Density Altitude Explained", channel: "FlightInsight", topics: ["density altitude", "high density", "temperature", "pressure altitude"], startTime: 0 },

  // VFR Minimums
  { videoId: "F3L0uYh2TtM", title: "VFR Weather Minimums Explained", channel: "FlightInsight", topics: ["vfr", "visibility", "cloud clearance", "weather minimums", "vfr minimums"], startTime: 0 },

  // Emergency Procedures
  { videoId: "bCqCmZ0zKJw", title: "Emergency Procedures - Engine Failure", channel: "FlightChops", topics: ["emergency", "engine failure", "forced landing", "best glide", "emergency landing"], startTime: 0 },

  // Cross-Country Planning
  { videoId: "G4KqW7nMx6U", title: "Cross-Country Flight Planning", channel: "FlightInsight", topics: ["cross country", "flight plan", "flight planning", "navigation log"], startTime: 0 },

  // Human Factors
  { videoId: "BzFgV4bV3tQ", title: "Aeronautical Decision Making (ADM)", channel: "AOPA", topics: ["human factors", "aeronautical decision", "adm", "imsafe", "hazardous attitude"], startTime: 0 },

  // Night Flying
  { videoId: "KpWjL3sJ1w0", title: "Night Flying Tips for Student Pilots", channel: "FlightChops", topics: ["night", "night flying", "night vfr", "night flight", "night operations"], startTime: 0 },

  // Navigation / VOR
  { videoId: "qJtjB5nMR7I", title: "VOR Navigation Explained", channel: "FlightInsight", topics: ["vor", "radial", "vor/dme", "vortac", "navigation", "bearing", "cdi"], startTime: 0 },

  // Takeoff and Landing Performance
  { videoId: "V0dGpPdWn6M", title: "Takeoff and Landing Performance Charts", channel: "FlightInsight", topics: ["takeoff performance", "landing performance", "performance charts", "runway length"], startTime: 0 },

  // Multi-Engine (introduction)
  { videoId: "KxTqK3qX4jY", title: "Multi-Engine Flying Basics", channel: "Fly8MA", topics: ["multiengine", "vmc", "critical engine", "multi-engine"], startTime: 0 },

  // Seaplane
  { videoId: "kFhJQXrCJxY", title: "Seaplane Flying Basics", channel: "FlightChops", topics: ["seaplane", "floatplane", "water landing", "water operations"], startTime: 0 },

  // Drones / sUAS
  { videoId: "WqL8Z8KJx3k", title: "Part 107 Made Easy", channel: "Pilot Institute", topics: ["drone", "suas", "part 107", "remote pilot", "unmanned"], startTime: 0 },
];

/**
 * Find curated external video references for a given question text + category.
 */
export function findExternalVideos(
  questionText: string,
  explanation?: string,
  topN: number = 2
): ExternalVideo[] {
  const combined = (questionText + ' ' + (explanation || '')).toLowerCase();
  const scored = EXTERNAL_VIDEOS.map(video => {
    const matchCount = video.topics.filter(t => combined.includes(t)).length;
    return { video, matchCount };
  })
  .filter(s => s.matchCount >= 1)
  .sort((a, b) => b.matchCount - a.matchCount);

  return scored.slice(0, topN).map(s => s.video);
}
