/**
 * Concept data for Concept Explorer Cards and Connect the Dots.
 * Each concept is an interactive learning unit with related concepts and simulation parameters.
 */

export interface Concept {
  id: string;
  name: string;
  category: string;
  description: string;
  relatedConcepts: string[];  // IDs of related concepts
  keyFacts: string[];
  commonMistakes: string[];
  questions: string[];         // Question IDs related to this concept
}

export const CONCEPTS: Concept[] = [
  {
    id: "carb-ice",
    name: "Carburetor Ice",
    category: "Aircraft Systems",
    description: "Ice formation in the carburetor venturi due to temperature drop from air acceleration and fuel vaporization.",
    relatedConcepts: ["engine-perf", "weather-icing", "emergency-proc"],
    keyFacts: [
      "Forms between 20-70°F with high humidity",
      "First indication: loss of RPM (fixed-pitch)",
      "Prevention: carburetor heat redirects hot air from exhaust",
      "Can occur even on warm days if humidity is high",
    ],
    commonMistakes: [
      "Thinking it only happens near freezing",
      "Confusing first indication with engine roughness",
      "Forgetting carb heat reduces available power temporarily",
    ],
    questions: ["2-3", "2-38", "2-94"],
  },
  {
    id: "stall",
    name: "Stall",
    category: "Aerodynamics",
    description: "Loss of lift when the critical angle of attack is exceeded, causing airflow separation from the wing.",
    relatedConcepts: ["aoa", "load-factor", "ground-effect", "emergency-proc"],
    keyFacts: [
      "Caused by exceeding critical AOA (~15-20°)",
      "Can happen at ANY airspeed, ANY attitude",
      "Stall speed increases with weight, load factor, and altitude",
      "Recovery: reduce AOA (push nose down), add power",
    ],
    commonMistakes: [
      "Believing stalls only happen at low speed",
      "Thinking power alone prevents stalls",
      "Confusing stall with engine failure",
    ],
    questions: ["3-9", "3-15", "3-33"],
  },
  {
    id: "aoa",
    name: "Angle of Attack",
    category: "Aerodynamics",
    description: "The angle between the wing's chord line and the relative wind. Determines how much lift the wing produces.",
    relatedConcepts: ["stall", "lift-drag", "load-factor"],
    keyFacts: [
      "Increases as pitch attitude increases (not always AOA)",
      "Critical AOA is the same regardless of weight or speed",
      "Stall warning activates 5-10 knots above stall speed",
      "Ground effect reduces effective AOA",
    ],
    commonMistakes: [
      "Confusing pitch attitude with angle of attack",
      "Thinking AOA is the same as nose-up attitude",
    ],
    questions: ["3-9", "2-94"],
  },
  {
    id: "density-alt",
    name: "Density Altitude",
    category: "Performance",
    description: "Pressure altitude corrected for non-standard temperature. Higher density altitude = thinner air = worse performance.",
    relatedConcepts: ["takeoff-perf", "engine-perf", "weather-temp"],
    keyFacts: [
      "Hot, high, humid = high density altitude",
      "Increases takeoff distance",
      "Decreases climb rate",
      "Affects both engine power and aerodynamic performance",
    ],
    commonMistakes: [
      "Thinking it only matters at high-elevation airports",
      "Confusing pressure altitude with density altitude",
      "Forgetting humidity reduces air density",
    ],
    questions: ["6-3", "6-52"],
  },
  {
    id: "load-factor",
    name: "Load Factor",
    category: "Aerodynamics",
    description: "The ratio of total lift to aircraft weight. Increases in turns, gusts, and abrupt maneuvers.",
    relatedConcepts: ["stall", "maneuvering-speed", "steep-turns"],
    keyFacts: [
      "1G in straight-and-level flight",
      "2G at 60° bank (stall speed increases 41%)",
      "Maneuvering speed (Va) = speed where full control deflection doesn't exceed structural limits",
      "Higher weight = higher load factor in same maneuver",
    ],
    commonMistakes: [
      "Forgetting stall speed increases in turns",
      "Confusing load factor with G-force",
    ],
    questions: ["3-33", "3-15"],
  },
  {
    id: "ground-effect",
    name: "Ground Effect",
    category: "Aerodynamics",
    description: "Reduced induced drag when flying within one wingspan of the ground, due to wingtip vortex reduction.",
    relatedConcepts: ["stall", "landing", "takeoff"],
    keyFacts: [
      "Occurs within ~1 wingspan of the ground",
      "Reduces induced drag significantly",
      "Can cause floating during landing",
      "Can help with short-field takeoff (lift off in ground effect, then climb)",
    ],
    commonMistakes: [
      "Using ground effect to extend a bad approach",
      "Not accounting for floating in landing distance",
    ],
    questions: ["3-15"],
  },
  {
    id: "engine-perf",
    name: "Engine Performance",
    category: "Aircraft Systems",
    description: "How temperature, altitude, mixture, and fuel affect engine power output.",
    relatedConcepts: ["density-alt", "carb-ice", "mixture"],
    keyFacts: [
      "Rich mixture = more fuel, less power at altitude",
      "Lean mixture = better fuel economy at cruise",
      "Peak EGT is the leanest mixture for best power",
      "High density altitude reduces manifold pressure and power",
    ],
    commonMistakes: [
      "Leaning too much at high altitude",
      "Not enriching mixture during descent",
    ],
    questions: ["2-3", "2-38"],
  },
  {
    id: "weather-icing",
    name: "Icing",
    category: "Weather",
    description: "Ice accumulation on aircraft surfaces and systems. Can be structural, induction, or windshield.",
    relatedConcepts: ["carb-ice", "weather-fronts", "emergency-proc"],
    keyFacts: [
      "Carburetor icing: 20-70°F with high humidity",
      "Structural icing: visible moisture + freezing temps",
      "Most dangerous in clear icing conditions (supercooled water droplets)",
      "De-ice/anti-ice systems have limitations",
    ],
    commonMistakes: [
      "Thinking anti-ice systems prevent all ice",
      "Underestimating icing severity in cloud",
    ],
    questions: ["9-16", "9-35"],
  },
  {
    id: "airspace",
    name: "Airspace Classes",
    category: "Regulations",
    description: "The classification system for controlled and uncontrolled airspace with specific VFR/IFR requirements.",
    relatedConcepts: ["vfr-minimums", "atc-comm", "transponder"],
    keyFacts: [
      "Class A: 18,000-60,000 ft, IFR only",
      "Class B: Major airports, clearance required",
      "Class C: Busy airports, two-way radio + transponder",
      "Class D: Towered airports, two-way radio",
      "Class E: Controlled, no radio required for VFR",
      "Class G: Uncontrolled, lowest minimums",
    ],
    commonMistakes: [
      "Confusing Class C and D requirements",
      "Forgetting Class E exists",
      "Not knowing Class G minimums vary by altitude",
    ],
    questions: ["5-14", "5-46", "5-55"],
  },
  {
    id: "vfr-minimums",
    name: "VFR Minimums",
    category: "Regulations",
    description: "Minimum visibility and cloud clearance required for VFR flight, varying by airspace class.",
    relatedConcepts: ["airspace", "weather", "night-flying"],
    keyFacts: [
      "Class G below 1,200 AGL: 3 SM, clear of clouds",
      "Class G 1,200-10,000 AGL: 5 SM, 500 below, 1000 above, 2000 horizontal",
      "Class E below 10,000 MSL: 3 SM, 500 below, 1000 above, 2000 horizontal",
      "Class E above 10,000 MSL: 5 SM, 1000 below, 1000 above, 1SM horizontal",
      "Class B: 3 SM, clear of clouds",
      "Class C, D: 3 SM, 500 below, 1000 above, 2000 horizontal",
    ],
    commonMistakes: [
      "Using Class E minimums in Class G",
      "Forgetting the 10,000 MSL threshold",
      "Confusing Class B and Class C requirements",
    ],
    questions: ["5-46", "5-55"],
  },
  {
    id: "vor-nav",
    name: "VOR Navigation",
    category: "Navigation",
    description: "Using VOR stations for en-route and terminal navigation with radials, courses, and CDI tracking.",
    relatedConcepts: ["gps-nav", "compass", "flight-planning"],
    keyFacts: [
      "Radials go FROM the station (like spokes outward)",
      "OBS sets desired course, CDI shows deviation",
      "TO/FROM flag indicates direction relative to OBS",
      "VOR range: ~40 nm at low altitude, ~130 nm at FL180",
      "Magnetic variation affects radial readings",
    ],
    commonMistakes: [
      "Tracking radials instead of courses",
      "Confusing TO and FROM flags",
      "Not accounting for magnetic variation",
    ],
    questions: ["7-36", "7-68"],
  },
  {
    id: "emergency-proc",
    name: "Emergency Procedures",
    category: "Safety",
    description: "Systematic response to in-flight emergencies: engine failure, fires, system malfunctions.",
    relatedConcepts: ["stall", "carb-ice", "forced-landing"],
    keyFacts: [
      "Engine failure: Establish best glide (Vg), pick landing spot, attempt restart",
      "Mayday call: Mayday x3, position, altitude, intention, souls on board",
      "Forced landing: Fuel off, mixture idle, master off, doors unlatched",
      "Aviate, Navigate, Communicate — in that order",
    ],
    commonMistakes: [
      "Panicking and forgetting to fly the airplane",
      "Spending too much time trying to restart",
      "Not declaring emergency early enough",
    ],
    questions: ["2-38", "9-16"],
  },
  {
    id: "weight-balance",
    name: "Weight and Balance",
    category: "Performance",
    description: "Ensuring the aircraft is within weight limits and center of gravity is in the approved range.",
    relatedConcepts: ["load-factor", "takeoff-perf"],
    keyFacts: [
      "CG forward: heavier controls, lower stall speed",
      "CG aft: lighter controls, higher stall speed, less stable",
      "Moment = Weight × Arm (station distance)",
      "Must check: ramp, takeoff, and landing weights",
    ],
    commonMistakes: [
      "Forgetting to check landing weight after fuel burn",
      "Not accounting for passenger weight accurately",
      "Ignoring baggage compartment limits",
    ],
    questions: ["1-4"],
  },
  {
    id: "night-flying",
    name: "Night Flying",
    category: "Operations",
    description: "Unique challenges of night flight: illusions, reduced visibility, special currency requirements.",
    relatedConcepts: ["human-factors", "vfr-minimums", "weather"],
    keyFacts: [
      "3 takeoffs/landings required for night VFR currency",
      "Black-hole illusion on approach (false sense of height)",
      "Somatogravic illusion during acceleration (nose-up feeling)",
      "Sterile cockpit required below 10,000 MSL",
    ],
    commonMistakes: [
      "Relying on body sensations instead of instruments",
      "Not planning for reduced visibility",
    ],
    questions: ["10-18"],
  },
  {
    id: "human-factors",
    name: "Human Factors",
    category: "Safety",
    description: "IMSAFE checklist, hazardous attitudes, aeronautical decision making, risk management.",
    relatedConcepts: ["emergency-proc", "night-flying", "flight-planning"],
    keyFacts: [
      "IMSAFE: Illness, Medication, Stress, Alcohol, Fatigue, Emotion",
      "5 hazardous attitudes: Anti-authority, Impulsivity, Invulnerability, Macho, Resignation",
      "ADM: Identify hazard → Evaluate risk → Implement solution → Review outcome",
      "Personal minimums add safety buffer beyond FARs",
    ],
    commonMistakes: [
      "Ignoring fatigue effects",
      "Not using personal minimums",
      "Falling into 'it won't happen to me' mindset",
    ],
    questions: ["10-31"],
  },
  {
    id: "pitot-static",
    name: "Pitot-Static System",
    category: "Instruments",
    description: "The pitot-static system uses ram air pressure and ambient pressure to drive the airspeed indicator, altimeter, and VSI.",
    relatedConcepts: ["flight-instruments", "emergency-proc"],
    keyFacts: [
      "Pitot tube captures ram air pressure (increases with speed)",
      "Static ports measure ambient atmospheric pressure",
      "ASI compares pitot vs static pressure to show airspeed",
      "Blocked pitot: ASI shows increasing airspeed during climb (false reading)",
      "Blocked static: altimeter freezes, VSI reads zero, ASI affected",
    ],
    commonMistakes: [
      "Confusing pitot and static port blockage effects",
      "Forgetting pitot heat in icing conditions",
      "Not checking for pitot tube obstructions during preflight",
    ],
    questions: ["4-30"],
  },
  {
    id: "flight-instruments",
    name: "Flight Instruments",
    category: "Instruments",
    description: "Six basic flight instruments: airspeed indicator, attitude indicator, altimeter, turn coordinator, heading indicator, vertical speed indicator.",
    relatedConcepts: ["pitot-static", "gyroscopic", "navigation"],
    keyFacts: [
      "Pitot-static instruments: ASI, altimeter, VSI",
      "Gyroscopic instruments: attitude, turn coordinator, heading indicator",
      "Magnetic compass: free-standing, subject to errors in turns and acceleration",
      "Attitude indicator fails last — most reliable in instrument conditions",
    ],
    commonMistakes: [
      "Confusing which instruments are pitot-static vs gyroscopic",
      "Not allowing warm-up time for gyroscopic instruments",
      "Trusting the magnetic compass during turns (acceleration error)",
    ],
    questions: ["4-30", "7-36"],
  },
  {
    id: "radio-comm",
    name: "Radio Communication",
    category: "Operations",
    description: "Standard phraseology, radio call formats, and communication procedures for ATC and traffic advisory.",
    relatedConcepts: ["airspace", "atc-comm", "emergency-proc"],
    keyFacts: [
      "Format: Who you're calling, who you are, where you are, what you want",
      "Always read back clearances (especially takeoff and landing)",
      "121.5 MHz for emergencies (guard frequency)",
      "Traffic Advisory: position, altitude, type, intentions",
    ],
    commonMistakes: [
      "Using non-standard phraseology",
      "Forgetting to read back critical clearances",
      "Not monitoring guard frequency (121.5 MHz)",
    ],
    questions: ["4-20"],
  },
  {
    id: "cross-country",
    name: "Cross-Country Planning",
    category: "Navigation",
    description: "Route selection, fuel planning, time/speed/distance calculations, and navigation log preparation.",
    relatedConcepts: ["vor-nav", "weather", "fuel-mgmt"],
    keyFacts: [
      "True course → magnetic variation → magnetic course → wind correction → heading",
      "Ground speed = TAS corrected for wind",
      "Time = Distance / Ground Speed",
      "Fuel required = Time × Fuel flow rate",
      "Plan checkpoints every 10-15 minutes",
    ],
    commonMistakes: [
      "Forgetting to account for wind correction angle",
      "Not planning fuel reserves (45 min VFR day, 30 min night)",
      "Using indicated airspeed instead of true airspeed for calculations",
    ],
    questions: ["7-1", "7-36"],
  },
  {
    id: "short-soft-field",
    name: "Short and Soft Field Operations",
    category: "Performance",
    description: "Specialized takeoff and landing techniques for short runways and soft surfaces.",
    relatedConcepts: ["ground-effect", "weight-balance", "takeoff-perf"],
    keyFacts: [
      "Short field: maximum performance, minimal ground roll",
      "Soft field: keep nose wheel off ground, reduce drag",
      "Short field takeoff: full power, brakes, rotate at Vx (best angle)",
      "Soft field: lift off in ground effect, accelerate, then climb",
      "Short field landing: aim for threshold, minimal float, firm touchdown",
    ],
    commonMistakes: [
      "Using wrong technique for conditions",
      "Flaring too high in short-field landing",
      "Not accounting for density altitude in short-field calculations",
    ],
    questions: ["8-15"],
  },
  {
    id: "traffic-pattern",
    name: "Traffic Pattern",
    category: "Operations",
    description: "Standard pattern legs, altitudes, speeds, and procedures at towered and non-towered airports.",
    relatedConcepts: ["radio-comm", "airspace", "emergency-proc"],
    keyFacts: [
      "Standard pattern: upwind, crosswind, downwind, base, final",
      "Pattern altitude: usually 1,000 ft AGL",
      "Most dangerous phase: base-to-final turn (stall/spin risk)",
      "Non-towered: announce position on CTAF",
      "Towered: follow ATC instructions, expect sequence",
    ],
    commonMistakes: [
      "Overshooting base-to-final turn",
      "Not announcing position at non-towered airports",
      "Flying too fast in the pattern",
    ],
    questions: ["4-45"],
  },
  {
    id: "fuel-mgmt",
    name: "Fuel Management",
    category: "Aircraft Systems",
    description: "Fuel planning, monitoring, and emergency procedures related to fuel exhaustion and starvation.",
    relatedConcepts: ["engine-perf", "emergency-proc", "cross-country"],
    keyFacts: [
      "Fuel exhaustion: no fuel on board (preventable with planning)",
      "Fuel starvation: fuel on board but can't reach engine",
      "Pre-flight: check quantity, quality (sump), and color",
      "In-flight: track time AND check gauges",
      "VFR reserves: 45 min day, 30 min night",
    ],
    commonMistakes: [
      "Relying only on fuel gauges (they can be inaccurate)",
      "Not sumping fuel during preflight",
      "Forgetting to switch tanks during flight",
    ],
    questions: ["2-25"],
  },
  {
    id: "weather-fronts",
    name: "Weather Fronts",
    category: "Weather",
    description: "Cold fronts, warm fronts, stationary fronts, and occluded fronts and their associated weather.",
    relatedConcepts: ["weather-icing", "vfr-minimums", "cross-country"],
    keyFacts: [
      "Cold front: rapid lifting, intense but short-lived storms",
      "Warm front: gradual lifting, widespread stratus, steady rain",
      "Cold front passage: wind shift, temperature drop, pressure rise",
      "Warm front passage: wind shift, temperature rise, pressure drop",
      "Worst weather: directly along and ahead of the front",
    ],
    commonMistakes: [
      "Flying too close to an active cold front",
      "Not recognizing warm front cloud progression (Cs → As → Ns)",
      "Ignoring frontal forecasts in the AIRMET/SIGMET",
    ],
    questions: ["9-8", "9-18"],
  },
];

/**
 * Get a concept by ID.
 */
export function getConcept(id: string): Concept | undefined {
  return CONCEPTS.find(c => c.id === id);
}

/**
 * Get concepts related to a concept.
 */
export function getRelatedConcepts(id: string): Concept[] {
  const concept = getConcept(id);
  if (!concept) return [];
  return concept.relatedConcepts.map(getConcept).filter(Boolean) as Concept[];
}

/**
 * Get concepts for a question ID.
 */
export function getConceptsForQuestion(questionId: string): Concept[] {
  return CONCEPTS.filter(c => c.questions.includes(questionId));
}
