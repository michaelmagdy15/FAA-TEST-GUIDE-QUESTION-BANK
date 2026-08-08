/**
 * Guided reasoning chains for "Why" Mode.
 * Each question can have a chain of reasoning steps that guide the student
 * from confusion to understanding, instead of just showing an answer.
 */
export interface ReasoningStep {
  prompt: string;       // What the student is asked to think about
  hint?: string;        // Optional hint if they're stuck
  reveal: string;       // The explanation that appears after they click
}

export interface ReasoningChain {
  questionId: string;
  steps: ReasoningStep[];
}

// Chains for key PPL topics - these are the highest-value questions
export const REASONING_CHAINS: ReasoningChain[] = [
  // === CARBURETOR ICE ===
  {
    questionId: "2-3",
    steps: [
      { prompt: "What conditions cause carburetor ice?", reveal: "Carburetor ice forms when the temperature drops below the freezing point of water inside the carburetor venturi. The venturi accelerates air, which cools it — even on days above 0°C outside." },
      { prompt: "What does ice in the venturi do to airflow?", reveal: "Ice restricts the venturi, reducing the amount of air entering the engine. Less air means less power produced." },
      { prompt: "On a fixed-pitch propeller, what happens when the engine loses power?", reveal: "A fixed-pitch propeller is mechanically linked to the engine. When power drops, the engine slows down — RPM decreases. This is the FIRST visible sign." },
      { prompt: "So what's the first indication of carburetor ice?", reveal: "A loss of RPM. Engine roughness comes later as ice builds further. Oil temperature changes are not a primary indicator." },
    ],
  },
  {
    questionId: "2-94",
    steps: [
      { prompt: "What is the angle of attack?", reveal: "The angle between the chord line of the wing and the relative wind. It's measured at the wing, not the horizon." },
      { prompt: "What happens as angle of attack increases?", reveal: "Lift increases — but only up to a point. The critical angle of attack (typically 15-20°) is where the wing stops producing enough lift." },
      { prompt: "What is a stall?", reveal: "A stall is NOT about engine power or airspeed alone — it's about exceeding the critical angle of attack. The airflow separates from the wing surface, and lift drops dramatically." },
    ],
  },
  // === STALLS ===
  {
    questionId: "3-9",
    steps: [
      { prompt: "What causes a stall?", reveal: "Exceeding the critical angle of attack. This can happen at any airspeed, any attitude, any power setting." },
      { prompt: "What happens to the airflow over the wing at high angles?", reveal: "The smooth laminar flow separates from the upper surface. Instead of producing lift, the wing produces turbulence and drag." },
      { prompt: "What is the result?", reveal: "The wings can no longer support the weight of the aircraft. The nose drops, airspeed increases, and the wing re-attaches airflow. That's stall recovery." },
    ],
  },
  // === DENSITY ALTITUDE ===
  {
    questionId: "6-3",
    steps: [
      { prompt: "What is density altitude?", reveal: "Density altitude is pressure altitude corrected for non-standard temperature. It represents how 'thin' the air actually is." },
      { prompt: "Why does hot air reduce performance?", reveal: "Hot air is less dense. Less dense air means fewer air molecules for the propeller to bite into and fewer molecules flowing over the wings. Both thrust and lift decrease." },
      { prompt: "What takes longer on a hot day?", reveal: "Takeoff roll. The aircraft needs more runway to reach rotation speed because it's producing less lift. Climb rate also decreases." },
    ],
  },
  // === VFR MINIMUMS ===
  {
    questionId: "5-46",
    steps: [
      { prompt: "What are VFR weather minimums?", reveal: "VFR minimums define the lowest visibility and cloud clearance required to fly under Visual Flight Rules. They vary by airspace class." },
      { prompt: "Why do different airspaces have different minimums?", reveal: "Busier airspace (Class B, C, D) has higher traffic density. Pilots need more visibility and separation from clouds to see and avoid other aircraft." },
      { prompt: "What's the pattern?", reveal: "Class G has the lowest minimums (3 SM, clear of clouds below 1,200 AGL). Class B requires 3 SM and clear of clouds. Class C, D, E above 10,000 MSL have the highest requirements." },
    ],
  },
  // === WEIGHT AND BALANCE ===
  {
    questionId: "1-4",
    steps: [
      { prompt: "What determines an aircraft's category?", reveal: "Aircraft are certificated based on their intended use and structural limits: Normal, Utility, and Acrobatic are the three main categories." },
      { prompt: "Why does category matter for loading?", reveal: "Each category has different weight limits and CG ranges. The Utility category allows more aggressive maneuvers but has stricter weight/balance requirements." },
    ],
  },
  // === LOAD FACTOR ===
  {
    questionId: "3-33",
    steps: [
      { prompt: "What is load factor?", reveal: "Load factor is the ratio of the total load (lift) to the weight of the aircraft. In straight-and-level flight, load factor = 1G (lift equals weight)." },
      { prompt: "What happens to load factor in a steep turn?", reveal: "As bank angle increases, the vertical component of lift must still equal weight. The total lift increases, so load factor increases. At 60° bank, load factor = 2G." },
      { prompt: "Why does this matter?", reveal: "Higher load factor means the wings are carrying more stress. The stall speed increases in a turn — a 60° bank increases stall speed by 41%. This is why steep turns at low speed are dangerous." },
    ],
  },
  // === GROUND EFFECT ===
  {
    questionId: "3-15",
    steps: [
      { prompt: "What is ground effect?", reveal: "Ground effect is the increased lift and decreased drag that occurs when a wing is flying very close to the ground (within one wingspan)." },
      { prompt: "Why does it happen?", reveal: "The ground interrupts the formation of wingtip vortices. With less vortex-induced downwash, the effective angle of attack increases and induced drag decreases." },
      { prompt: "What's the danger?", reveal: "An aircraft in ground effect may float down the runway, unable to land. If the pilot tries to force it down, they may flare too high, stall, and land hard." },
    ],
  },
  // === NIGHT FLYING ===
  {
    questionId: "10-18",
    steps: [
      { prompt: "Why is night flying different?", reveal: "Without visual references to the horizon, your body relies on inner-ear balance (vestibular system) which can give false sensations." },
      { prompt: "What illusions can occur?", reveal: "The leans (false sense of bank), graveyard spiral (unnoticed descent), and somatogravic illusion (false sense of pitch up during acceleration)." },
      { prompt: "How do you stay safe?", reveal: "Trust your instruments, not your body. Maintain instrument scan, use the sterile cockpit rule, and ensure proper night currency." },
    ],
  },
  // === EMERGENCY PROCEDURES ===
  {
    questionId: "2-38",
    steps: [
      { prompt: "What should you do in an engine failure?", reveal: "First: establish the best glide speed (Vg). This gives you maximum distance to find a landing spot." },
      { prompt: "Why Vg specifically?", reveal: "At Vg, the aircraft achieves the best lift-to-drag ratio, meaning maximum glide distance. Too fast or too slow, and you cover less ground." },
      { prompt: "What's next?", reveal: "Pick a landing spot, attempt an engine restart if time permits, communicate your position and intentions (121.5 MHz), and prepare for forced landing." },
    ],
  },
  // === NAVIGATION ===
  {
    questionId: "7-36",
    steps: [
      { prompt: "How does a VOR work?", reveal: "A VOR transmits two signals: a rotating variable signal and a reference signal. The phase difference between them tells you your radial from the station." },
      { prompt: "What is a radial?", reveal: "A radial is a magnetic bearing FROM the VOR station. Radials radiate outward like spokes on a wheel — 360 of them, 1° apart." },
      { prompt: "How do you track TO a VOR?", reveal: "Set the OBS to the inbound course. If the CDI is centered with a TO flag, you're on course. If the needle deflects, turn toward it to intercept." },
    ],
  },
  // === WEATHER ===
  {
    questionId: "9-18",
    steps: [
      { prompt: "What's the difference between METAR and TAF?", reveal: "METAR is an observation (current conditions). TAF is a forecast (predicted conditions for the next 24-30 hours)." },
      { prompt: "What do the numbers mean in a METAR?", reveal: "Visibility in statute miles, cloud layers in hundreds of feet AGL, temperature and dewpoint in Celsius, altimeter setting in inches of mercury." },
    ],
  },
  // === AIRSPACE ===
  {
    questionId: "5-55",
    steps: [
      { prompt: "What is Class B airspace?", reveal: "Class B surrounds the busiest airports (like LAX, JFK, ORD). It's shaped like an inverted wedding cake with multiple rings." },
      { prompt: "What do you need to enter?", reveal: "Explicit ATC clearance, Mode C transponder, and two-way radio communication. No exceptions — you must be cleared before entering." },
      { prompt: "Why so strict?", reveal: "These are the highest-traffic airports in the system. A collision here would be catastrophic. The strict requirements ensure ATC has positive control of all traffic." },
    ],
  },
  // === WEIGHT AND BALANCE ===
  {
    questionId: "1-34",
    steps: [
      { prompt: "Why does center of gravity matter?", reveal: "The CG position affects stability and control. Aft CG makes the aircraft less stable and harder to recover from stalls. Forward CG increases stall speed but improves stability." },
      { prompt: "How do you calculate moment?", reveal: "Moment = Weight × Arm (distance from datum). Each item (pilot, passenger, fuel, baggage) contributes its own moment. Total moment divided by total weight = CG position." },
      { prompt: "What happens if CG is out of limits?", reveal: "Forward CG: heavier controls, longer takeoff roll, reduced climb. Aft CG: lighter controls, possible inability to recover from stall, reduced forward stability. Both are dangerous." },
    ],
  },
  // === WEATHER FRONTS ===
  {
    questionId: "9-8",
    steps: [
      { prompt: "What is a cold front?", reveal: "A cold front is the leading edge of a cold air mass replacing warmer air. Cold air is denser, so it wedges under the warm air, lifting it rapidly." },
      { prompt: "What weather does a cold front produce?", reveal: "Rapid lifting creates tall cumulonimbus clouds, heavy rain, thunderstorms, turbulence, and wind shifts. Weather is intense but short-lived (1-2 hours)." },
      { prompt: "How does a warm front differ?", reveal: "Warm air rides up over retreating cold air gradually. This produces widespread stratus clouds, steady rain, and poor visibility over large areas. Weather lasts longer (6-12 hours)." },
    ],
  },
  // === RADIO COMMUNICATION ===
  {
    questionId: "4-20",
    steps: [
      { prompt: "What is the standard radio call format?", reveal: "Who you're calling, who you are, where you are, what you want. Example: 'Tower, Cessna 123AB, runway 27, ready for departure.'" },
      { prompt: "Why is proper phraseology important?", reveal: "ATC handles hundreds of aircraft. Standardized phraseology eliminates ambiguity. Non-standard calls create confusion, increase workload, and can lead to separation errors." },
      { prompt: "What does 'cleared for takeoff' mean?", reveal: "It's an explicit authorization to depart. You must read back this clearance. Never assume — if you're unsure, ask ATC to clarify. Miscommunication is a leading cause of runway incursions." },
    ],
  },
  // === FLIGHT INSTRUMENTS ===
  {
    questionId: "4-30",
    steps: [
      { prompt: "How does the pitot-static system work?", reveal: "The pitot tube captures ram air pressure (increases with speed). Static ports measure ambient atmospheric pressure. The airspeed indicator compares these two to show indicated airspeed." },
      { prompt: "What happens if the pitot tube is blocked?", reveal: "Ram air pressure is trapped. As altitude increases, static pressure decreases, but trapped ram pressure stays the same. The ASI shows an INCREASING airspeed reading — dangerously false." },
      { prompt: "How do you detect a blockage?", reveal: "If the ASI reads zero at takeoff, the pitot tube is likely blocked. If it shows an increase during climb without acceleration, the static port may be blocked (altimeter and VSI also affected)." },
    ],
  },
  // === CROSS-COUNTRY PLANNING ===
  {
    questionId: "7-1",
    steps: [
      { prompt: "What is the first step in cross-country planning?", reveal: "Select your route, check airspace, and identify checkpoints. Then calculate time, fuel, and distance for each segment using true course, wind correction, and ground speed." },
      { prompt: "Why do you need true course and not magnetic?", reveal: "True course is measured from true north on the chart. Your compass reads magnetic north. The difference is magnetic variation, which varies by location. You must convert between them." },
      { prompt: "What about wind correction?", reveal: "Wind pushes the aircraft off course. You calculate a wind correction angle (WCA) to crab into the wind. The result is your heading — the direction the nose actually points." },
    ],
  },
  // === SHORT AND SOFT FIELD ===
  {
    questionId: "8-15",
    steps: [
      { prompt: "What's different about short-field takeoff?", reveal: "Maximum performance is critical. Use full power, hold brakes, release and rotate at the shortest possible distance. Climb at Vy (best rate) to clear obstacles." },
      { prompt: "What about soft field takeoff?", reveal: "Soft surfaces (grass, sand, mud) create drag on the wheels. Keep the nose wheel off the ground as long as possible to reduce drag. Lift off into ground effect, then accelerate." },
      { prompt: "Why the difference in technique?", reveal: "Short field: minimize ground roll distance. Soft field: minimize wheel drag. They're optimized for different problems. Using the wrong technique reduces safety margin." },
    ],
  },
  // === TRAFFIC PATTERN ===
  {
    questionId: "4-45",
    steps: [
      { prompt: "What are the standard traffic pattern legs?", reveal: "Upwind, crosswind, downwind, base, and final approach. Each leg has specific altitudes, speeds, and radio call requirements." },
      { prompt: "Why fly at pattern altitude?", reveal: "Standard pattern altitude (usually 1,000 ft AGL) ensures all aircraft are at the same height, making traffic predictable. Deviations must be announced." },
      { prompt: "What's the most critical phase?", reveal: "Base-to-final turn. This is where most pattern accidents occur. Too fast or too steep, and you can enter a stall/spin. Maintain safe speed and shallow bank angle." },
    ],
  },
  // === FUEL MANAGEMENT ===
  {
    questionId: "2-25",
    steps: [
      { prompt: "Why is fuel management critical?", reveal: "Fuel exhaustion (running out of fuel) is a leading cause of engine failure accidents. Many of these are preventable with proper planning and monitoring." },
      { prompt: "What's the difference between fuel exhaustion and starvation?", reveal: "Exhaustion: no fuel on board. Starvation: fuel is on board but can't reach the engine (e.g., fuel selector on wrong tank, blocked line). Both cause engine failure." },
      { prompt: "How do you prevent fuel issues?", reveal: "Pre-flight: check fuel quantity, quality, and color. In-flight: monitor fuel gauges AND track time. Carry reserves: 45 min VFR day, 30 min VFR night. Use fuel management checklist." },
    ],
  },
  // === HUMAN FACTORS / IMSAFE ===
  {
    questionId: "10-31",
    steps: [
      { prompt: "What is the IMSAFE checklist?", reveal: "Illness, Medication, Stress, Alcohol, Fatigue, Emotion. A pre-flight self-assessment to ensure you're fit to fly. If any item is questionable, don't fly." },
      { prompt: "Why does fatigue matter so much?", reveal: "Fatigue degrades reaction time, judgment, and decision-making — similar to alcohol impairment. After 18 hours without sleep, performance equals a 0.05% BAC." },
      { prompt: "What are the 5 hazardous attitudes?", reveal: "Anti-authority ('rules don't apply'), Impulsivity ('act first'), Invulnerability ('it won't happen to me'), Macho ('I can do it'), Resignation ('what's the use'). Each has a antidote." },
    ],
  },
];

/**
 * Get reasoning chain for a question, if one exists.
 */
export function getReasoningChain(questionId: string): ReasoningChain | null {
  return REASONING_CHAINS.find(c => c.questionId === questionId) || null;
}
