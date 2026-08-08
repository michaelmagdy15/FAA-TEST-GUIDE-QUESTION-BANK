export interface Lecture {
  num: number;
  videoId: string;
  title: string;
  topics: string[];
}

export const LECTURES: Lecture[] = [
  { num: 1, videoId: "jeI3wpulyPw", title: "Introduction to Private Pilot Ground School", topics: ["aviation fundamentals", "categories", "certifications", "FAR", "regulations", "airmen", "aircraft"] },
  { num: 2, videoId: "edLnZgF9mUg", title: "Airplane Aerodynamics", topics: ["aerodynamics", "lift", "drag", "thrust", "weight", "stall", "angle of attack", "airfoil", "Bernoulli", "wing", "control surfaces", "flaps", "load factor", "maneuvers"] },
  { num: 3, videoId: "PHtPau1c5sU", title: "Learning to Fly", topics: ["flight training", "lessons", "practice", "stalls", "turns", "ground reference", " maneuvers", "slip", "skid", "coordination"] },
  { num: 4, videoId: "AYF3spOVbBk", title: "Aircraft Systems", topics: ["engine", "fuel system", "electrical", "hydraulic", "propeller", "piston engine", "lycoming", "carburetor", "ignition", "oil", "cooling", "vacuum", "pitot-static"] },
  { num: 5, videoId: "Nts_8ZLIxwo", title: "Charts and Airspace", topics: ["sectional chart", "airspace", "classes", "special use", "VFR", "IFR", "TFR", "MOA", "class A", "class B", "class C", "class D", "class E", "class G", "chart symbols", "airport"] },
  { num: 6, videoId: "shHvE6yV4IM", title: "The Flight Environment", topics: ["weather", "atmosphere", "density altitude", "pressure", "temperature", "wind", "performance", "altitude effects"] },
  { num: 7, videoId: "Th2N_rDfkDw", title: "Navigation", topics: ["VOR", "GPS", "pilotage", "dead reckoning", "magnetic compass", "heading", "course", "navigation", "map", "chart", "radial", "bearing", "track", "wind correction"] },
  { num: 8, videoId: "OlQie93CwLY", title: "Helicopter Aerodynamics", topics: ["helicopter", "rotor", "autorotation", "hover", "translational lift"] },
  { num: 9, videoId: "xPEqTH-c9Cc", title: "Meteorology", topics: ["weather", "METAR", "TAF", "weather patterns", "fronts", "thunderstorms", "icing", "fog", "clouds", "visibility", "wind shear", "turbulence", "aviation weather", "AIRMET", "SIGMET"] },
  { num: 10, videoId: "alLh1Jdqwvg", title: "Communication and Flight Information", topics: ["ATC", "radio", "communication", "CTAF", "tower", "approach", "departure", "NOTAM", "TFR", "flight service", "AWOS", "ASOS", "ATIS", "frequencies", "transponder", "squawk"] },
  { num: 11, videoId: "MNIYBTHc6mg", title: "Aircraft Ownership and Maintenance", topics: ["maintenance", "inspection", "airworthiness", "AD", "logbook", "annual", "100-hour", "Type Certificate", "STC", "owner responsibilities"] },
  { num: 12, videoId: "3sB64Au76h0", title: "Aircraft Performance", topics: ["performance", "takeoff", "landing", "density altitude", "weight", "runway length", "ground roll", "clearance", "POH", "charts"] },
  { num: 13, videoId: "-dOX_4lI6HY", title: "Interpreting Weather Data", topics: ["METAR", "TAF", "weather charts", "AIRMET", "SIGMET", "PIREPS", "weather briefing", "weather symbols"] },
  { num: 14, videoId: "RSuztJUlgOM", title: "Human Factors", topics: ["human factors", "aeronautical decision making", "ADM", "CRM", "fatigue", "stress", "IMSAFE", "hazardous attitudes", "risk management", "situational awareness", "sterile cockpit"] },
  { num: 15, videoId: "EvcoYJtoQVw", title: "Flight Planning", topics: ["flight planning", "navigation log", "fuel planning", "cross country", "VFR flight plan", "E6B", "flight plan", "weather check", "route planning"] },
  { num: 16, videoId: "xsO2Ip6eiaY", title: "Seaplanes", topics: ["seaplane", "floatplane", "water operations", "docking", "water landing"] },
  { num: 17, videoId: "geJHchWUYQk", title: "Small UAS Operations", topics: ["drone", "sUAS", "Part 107", "remote pilot", "unmanned"] },
  { num: 18, videoId: "802a1jvk5Ck", title: "Weight and Balance", topics: ["weight and balance", "CG", "center of gravity", "loading", "moment", "stations", "envelope", "overweight"] },
  { num: 19, videoId: "ksyY5wa5_50", title: "Multi-Engine and Jets", topics: ["multiengine", "Vmc", "asymmetric thrust", "jet", "turbine", "multi-engine", "critical engine"] },
  { num: 20, videoId: "EuNXVy5-KgA", title: "Flying at Night", topics: ["night flight", "night VFR", "lighting", "illusion", "night currencies", "night equipment"] },
  { num: 21, videoId: "kiCNa95DnnE", title: "Weather Minimums and Final Tips", topics: ["weather minimums", "VFR minimums", "visibility", "cloud clearance", "exam tips", "test tips", "practical test"] },
];

export const CATEGORY_TO_LECTURES: Record<string, number[]> = {
  "Aviation Fundamentals": [1, 10, 11, 21],
  "Aerodynamics": [2, 3, 12],
  "Aircraft Systems": [4, 11, 18],
  "Flight Environment": [6, 9, 12, 13],
  "Flight Instruments": [4, 6, 9],
  "Navigation": [7, 15],
  "Weather": [9, 13, 21],
  "Regulations & Airspace": [1, 5, 10, 11, 21],
  "Emergency Procedures": [3, 4, 14, 19],
  "Cross-Country Flying": [7, 15, 5],
  "Night Flying": [20, 9, 14],
  "Special Operations": [8, 16, 17, 19],
};
