export const C172 = {
    engine: {
        manufacturer: 'Textron Lycoming',
        model: 'IO-360-L2A',
        maxPower: '160 BHP',
        maxRPM: 2400,
        maxOilTempF: 245,
        oilTempRedArcStart: 245,
        oilTempRedArcEnd: 250,
        oilPressMin: 20,
        oilPressMax: 115,
        oilPressGreen: [50, 90] as const,
    },
    fuel: {
        total: 56.0,
        totalPerTank: 28.0,
        usable: 53.0,
        usablePerTank: 26.5,
        unusable: 3.0,
        unusablePerTank: 1.5,
        grades: ['100LL Grade (Blue)', '100 Grade (Green)'],
        lbPerGallon: 6.0,
    },
    oil: {
        sumpQt: 8,
        totalQt: 9,
    },
    flaps: {
        takeoff: 'Up to 10°',
        landing: 'Up to FULL',
    },
    weights: {
        standardEmpty: 1639,
        maxUsefulLoadNormal: 818,
        maxUsefulLoadUtility: 568,
        rampNormal: 2457,
        rampUtility: 2207,
        takeoffNormal: 2450,
        takeoffUtility: 2200,
        landingNormal: 2450,
        landingUtility: 2200,
    },
    airspeedMin: 20,
    airspeedMax: 170,
    vne: 163,
    maxCrosswindKnots: 15,
};

export interface Band {
    min: number;
    max: number;
    label: string;
    color: string;
    desc: string;
}

export const AIRSPEED_BANDS: Band[] = [
    { min: 20, max: 33, label: 'Low Airspeed Warning', color: '#ef4444', desc: 'Red arc (G1000 indicator only) — low airspeed warning. Not shown on the conventional steam-gauge indicator.' },
    { min: 33, max: 44, label: 'White Arc (Flap Range)', color: '#e2e8f0', desc: 'Full flap operating range, lower portion. VSO is the stall speed at maximum weight in the landing configuration.' },
    { min: 44, max: 85, label: 'Green + White Arc', color: '#10b981', desc: 'Normal operating range while remaining within the flap operating range. Lower limit VS1 (44 KIAS), upper limit VFE (85 KIAS).' },
    { min: 85, max: 129, label: 'Green Arc (Normal Range)', color: '#10b981', desc: 'Normal operating range from VS1 (44 KIAS) to VNO (129 KIAS).' },
    { min: 129, max: 163, label: 'Yellow Arc (Caution)', color: '#f59e0b', desc: 'Caution range from VNO (129 KIAS) to VNE (163 KIAS). Operations must be conducted with caution and only in smooth air.' },
    { min: 163, max: 170, label: 'Red Line — VNE', color: '#ef4444', desc: 'Never exceed speed, 163 KIAS (160 KCAS). Do not exceed this speed in any operation — structural failure may occur.' },
];

export const BAND_SPEEDS = [
    { kias: 33, label: 'VSO', name: 'Stall, landing config' },
    { kias: 44, label: 'VS1', name: 'Stall, flaps up' },
    { kias: 60, label: 'VX', name: 'Best angle of climb' },
    { kias: 79, label: 'VY', name: 'Best rate of climb' },
    { kias: 85, label: 'VFE', name: 'Max flaps full' },
    { kias: 110, label: 'VFE 10°', name: 'Max flaps 10°' },
    { kias: 129, label: 'VNO', name: 'Max structural cruise' },
    { kias: 163, label: 'VNE', name: 'Never exceed' },
];

export interface VSpeed {
    symbol: string;
    name: string;
    kias: number;
    kcas?: number;
    note: string;
    marker: number;
}

export const V_SPEEDS: VSpeed[] = [
    { symbol: 'VNE', name: 'Never Exceed Speed', kias: 163, kcas: 160, marker: 163, note: 'Do not exceed this speed in any operation.' },
    { symbol: 'VNO', name: 'Maximum Structural Cruising Speed', kias: 129, kcas: 126, marker: 129, note: 'Do not exceed this speed except in smooth air, and then only with caution.' },
    { symbol: 'VA 2450 lb', name: 'Maneuvering Speed', kias: 99, kcas: 97, marker: 99, note: 'Do not make full or abrupt control movements above this speed.' },
    { symbol: 'VA 2200 lb', name: 'Maneuvering Speed', kias: 94, kcas: 93, marker: 94, note: 'Maneuvering speed decreases with weight.' },
    { symbol: 'VA 1600 lb', name: 'Maneuvering Speed', kias: 82, kcas: 82, marker: 82, note: 'Maneuvering speed decreases with weight.' },
    { symbol: 'VFE', name: 'Maximum Flap Extended Speed (10° to FULL)', kias: 85, kcas: 84, marker: 85, note: 'Do not exceed this speed with flaps down.' },
    { symbol: 'VFE 10°', name: 'Maximum Flap Extended Speed (Flaps 10°)', kias: 110, kcas: 108, marker: 110, note: 'Do not exceed this speed with flaps at 10°.' },
    { symbol: 'VSO', name: 'Stall Speed, Landing Configuration', kias: 33, marker: 33, note: 'Maximum weight, flaps down. Lower limit of the white arc.' },
    { symbol: 'VS1', name: 'Stall Speed, Flaps Up', kias: 44, marker: 44, note: 'Maximum weight, most forward CG. Lower limit of the green arc.' },
    { symbol: 'VY', name: 'Best Rate of Climb', kias: 79, marker: 79, note: 'Gives the most altitude in a given time. Sea level value; decreases with altitude (71 KIAS at 10,000 ft).' },
    { symbol: 'VX', name: 'Best Angle of Climb', kias: 60, marker: 60, note: 'Gives the most altitude over a given horizontal distance. Sea level value; increases with altitude (65 KIAS at 10,000 ft).' },
    { symbol: 'VW', name: 'Maximum Window Open Speed', kias: 163, kcas: 160, marker: 163, note: 'Do not exceed this speed with windows open.' },
];

export interface GaugeZone {
    from: number;
    to: number;
    color: string;
    label: string;
}

export interface Gauge {
    id: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    default: number;
    zones: GaugeZone[];
    note: string;
}

const GREEN = '#10b981';
const YELLOW = '#f59e0b';
const RED = '#ef4444';

export const POWERPLANT_GAUGES: Gauge[] = [
    {
        id: 'tach', label: 'Tachometer', unit: 'RPM', min: 0, max: 2700, step: 10, default: 2400,
        zones: [
            { from: 0, to: 1900, color: '#94a3b8', label: 'Below range' },
            { from: 1900, to: 2400, color: GREEN, label: 'Normal operating range' },
            { from: 2400, to: 2700, color: RED, label: 'Red arc — maximum operating limit is the lower end' },
        ],
        note: 'Maximum engine speed is 2400 RPM. The red arc runs 2400 to 2700 RPM.',
    },
    {
        id: 'cht', label: 'Cylinder Head Temperature', unit: '°F', min: 0, max: 500, step: 5, default: 380,
        zones: [
            { from: 0, to: 200, color: '#94a3b8', label: 'Below range' },
            { from: 200, to: 500, color: GREEN, label: 'Normal operating range' },
        ],
        note: 'Green arc is 200 to 500°F.',
    },
    {
        id: 'oilTemp', label: 'Oil Temperature', unit: '°F', min: 0, max: 250, step: 1, default: 200,
        zones: [
            { from: 0, to: 100, color: '#94a3b8', label: 'Below range' },
            { from: 100, to: 245, color: GREEN, label: 'Normal operating range' },
            { from: 245, to: 250, color: RED, label: 'Red arc — max oil temperature 245°F (118°C)' },
        ],
        note: 'Maximum oil temperature is 245°F (118°C).',
    },
    {
        id: 'oilPress', label: 'Oil Pressure', unit: 'PSI', min: 0, max: 120, step: 1, default: 70,
        zones: [
            { from: 0, to: 20, color: RED, label: 'Red arc (min) — below 20 PSI' },
            { from: 20, to: 50, color: '#94a3b8', label: 'Below normal' },
            { from: 50, to: 90, color: GREEN, label: 'Normal operating range' },
            { from: 90, to: 115, color: '#94a3b8', label: 'Above normal' },
            { from: 115, to: 120, color: RED, label: 'Red arc (max) — above 115 PSI' },
        ],
        note: 'Oil pressure minimum 20 PSI, maximum 115 PSI.',
    },
    {
        id: 'fuelQty', label: 'Fuel Quantity (per tank)', unit: 'Gal', min: 0, max: 28, step: 0.5, default: 20,
        zones: [
            { from: 0, to: 5, color: YELLOW, label: 'Yellow arc — low fuel (1.5 gal unusable per tank)' },
            { from: 5, to: 24, color: GREEN, label: 'Normal operating range' },
            { from: 24, to: 28, color: '#94a3b8', label: 'Above green — top of tank' },
        ],
        note: 'Red line at 0. 1.5 gallons per tank is unusable; 26.5 gallons per tank is usable.',
    },
    {
        id: 'fuelFlow', label: 'Fuel Flow', unit: 'GPH', min: 0, max: 11, step: 0.1, default: 8,
        zones: [
            { from: 0, to: 11, color: GREEN, label: 'Normal operating range' },
        ],
        note: 'Green arc is 0 to 11 GPH.',
    },
    {
        id: 'vacuum', label: 'Vacuum Indicator', unit: 'in.Hg', min: 0, max: 7, step: 0.1, default: 5,
        zones: [
            { from: 0, to: 4.5, color: '#94a3b8', label: 'Below range' },
            { from: 4.5, to: 5.5, color: GREEN, label: 'Normal operating range' },
            { from: 5.5, to: 7, color: '#94a3b8', label: 'Above range' },
        ],
        note: 'Green arc is 4.5 to 5.5 in.Hg.',
    },
];

export const ACCENT = '#06b6d4';

export type UnitSystem = 'imperial' | 'metric';

export const u = {
    knots: (v: number, units: UnitSystem) => units === 'metric' ? `${Math.round(v * 1.852)} km/h` : `${v} KIAS`,
    knotsPlain: (v: number, units: UnitSystem) => units === 'metric' ? Math.round(v * 1.852) : v,
    knotsUnit: (units: UnitSystem) => units === 'metric' ? 'km/h' : 'KIAS',
    tempF: (v: number, units: UnitSystem) => units === 'metric' ? `${Math.round((v - 32) * 5 / 9)}°C` : `${v}°F`,
    tempUnit: (units: UnitSystem) => units === 'metric' ? '°C' : '°F',
    lb: (v: number, units: UnitSystem) => units === 'metric' ? `${Math.round(v * 0.4536)} kg` : `${v} lb`,
    lbPlain: (v: number, units: UnitSystem) => units === 'metric' ? Math.round(v * 0.4536) : v,
    lbUnit: (units: UnitSystem) => units === 'metric' ? 'kg' : 'lb',
    gal: (v: number, units: UnitSystem) => units === 'metric' ? `${(v * 3.785).toFixed(1)} L` : `${v} gal`,
    galPlain: (v: number, units: UnitSystem) => units === 'metric' ? +(v * 3.785).toFixed(1) : v,
    galUnit: (units: UnitSystem) => units === 'metric' ? 'L' : 'gal',
    galPerTank: (v: number, units: UnitSystem) => units === 'metric' ? `${(v * 3.785).toFixed(1)} L` : `${v} gal`,
    qt: (v: number, units: UnitSystem) => units === 'metric' ? `${(v * 0.9464).toFixed(1)} L` : `${v} qt`,
    psi: (v: number, units: UnitSystem) => units === 'metric' ? `${Math.round(v * 6.895)} kPa` : `${v} PSI`,
    psiRange: (lo: number, hi: number, units: UnitSystem) => units === 'metric' ? `${Math.round(lo * 6.895)}–${Math.round(hi * 6.895)} kPa` : `${lo}–${hi} PSI`,
    inhg: (v: number, units: UnitSystem) => units === 'metric' ? `${(v * 3.386).toFixed(1)} kPa` : `${v} in.Hg`,
    gph: (v: number, units: UnitSystem) => units === 'metric' ? `${(v * 3.785).toFixed(1)} L/h` : `${v} GPH`,
    gphRange: (lo: number, hi: number, units: UnitSystem) => units === 'metric' ? `${(lo * 3.785).toFixed(1)}–${(hi * 3.785).toFixed(1)} L/h` : `${lo}–${hi} GPH`,
    knotsLabel: (units: UnitSystem) => units === 'metric' ? 'km/h' : 'KIAS',
    knot: (v: number) => `${v} knots`,
};

export interface OpSpeed {
    category: string;
    label: string;
    kias: string;
    note?: string;
}

export const OPERATIONAL_SPEEDS: OpSpeed[] = [
    { category: 'Takeoff', label: 'Normal Climb', kias: '70–80' },
    { category: 'Takeoff', label: 'Short Field Takeoff (Flaps 10°, at 50 ft)', kias: '57' },
    { category: 'Climb (Flaps Up)', label: 'Normal, Sea Level', kias: '75–85' },
    { category: 'Climb (Flaps Up)', label: 'Normal, 10,000 ft', kias: '70–80' },
    { category: 'Climb (Flaps Up)', label: 'Best Rate of Climb (VY), Sea Level', kias: '79' },
    { category: 'Climb (Flaps Up)', label: 'Best Rate of Climb (VY), 10,000 ft', kias: '71' },
    { category: 'Climb (Flaps Up)', label: 'Best Angle of Climb (VX), Sea Level', kias: '60' },
    { category: 'Climb (Flaps Up)', label: 'Best Angle of Climb (VX), 10,000 ft', kias: '65' },
    { category: 'Landing Approach', label: 'Normal Approach, Flaps UP', kias: '65–75' },
    { category: 'Landing Approach', label: 'Normal Approach, Flaps FULL', kias: '60–70' },
    { category: 'Landing Approach', label: 'Short Field Approach, Flaps FULL', kias: '62' },
    { category: 'Balked Landing', label: 'Maximum Power, Flaps 20°', kias: '55' },
    { category: 'Turbulence', label: 'Max Turbulent Air Penetration (2450 lb)', kias: '99' },
    { category: 'Turbulence', label: 'Max Turbulent Air Penetration (2200 lb)', kias: '94' },
    { category: 'Turbulence', label: 'Max Turbulent Air Penetration (1600 lb)', kias: '82' },
    { category: 'Crosswind', label: 'Max Demonstrated Crosswind (Takeoff or Landing)', kias: '15 knots', note: 'Not an absolute limit — requires pilot skill assessment' },
];

export interface ChecklistScenario {
    id: string;
    title: string;
    description: string;
    steps: string[];
}

export const EMERGENCY_SCENARIOS: ChecklistScenario[] = [
    {
        id: 'ef-takeoff-roll',
        title: 'Engine Failure During Takeoff Roll',
        description: 'The engine loses power during the takeoff roll, before the aircraft is airborne.',
        steps: [
            'Throttle Control - IDLE (pull full out)',
            'Brakes - APPLY',
        ],
    },
    {
        id: 'ef-after-takeoff',
        title: 'Engine Failure Immediately After Takeoff',
        description: 'The engine fails right after liftoff, with limited runway or terrain ahead.',
        steps: [
            'Airspeed - 65 KIAS - Flaps UP',
            'Airspeed - 60 KIAS - Flaps 10° to FULL',
            'Land - STRAIGHT AHEAD',
        ],
    },
    {
        id: 'ef-flight-restart',
        title: 'Engine Failure During Flight (Restart)',
        description: 'The engine quits in cruise flight. You attempt an in-flight restart.',
        steps: [
            'Airspeed - 65 KIAS (best glide speed)',
            'FUEL SHUTOFF Valve - ON (push full in)',
            'FUEL SELECTOR Valve - BOTH',
            'FUEL PUMP Switch - ON',
            'Mixture Control - RICH (if restart has not occurred)',
        ],
    },
    {
        id: 'fire-start-starts',
        title: 'Engine Fire During Start — Engine Starts',
        description: 'An engine fire occurs during start on the ground and the engine starts running.',
        steps: [
            'MAGNETOS Switch - START (continue cranking)',
            'Power - 1800 RPM (for a few minutes)',
            'Engine - SHUTDOWN (inspect for damage)',
        ],
    },
    {
        id: 'fire-start-no-start',
        title: 'Engine Fire During Start — Engine Fails to Start',
        description: 'An engine fire occurs during start on the ground and the engine does not start.',
        steps: [
            'Throttle Control - FULL (push full in)',
            'Mixture Control - IDLE CUTOFF (pull full out)',
            'MAGNETOS Switch - START (continue cranking)',
            'FUEL SHUTOFF Valve - OFF (pull full out)',
            'FUEL PUMP Switch - OFF',
            'MAGNETOS Switch - OFF',
            'STBY BATT Switch - OFF',
            'MASTER Switch (ALT and BAT) - OFF',
        ],
    },
    {
        id: 'fire-engine-flight',
        title: 'Engine Fire In Flight',
        description: 'An engine fire develops during flight.',
        steps: [
            'Mixture Control - IDLE CUTOFF (pull full out)',
            'FUEL SHUTOFF Valve - OFF (pull full out)',
            'FUEL PUMP Switch - OFF',
            'MASTER Switch (ALT and BAT) - OFF',
        ],
    },
    {
        id: 'fire-electrical',
        title: 'Electrical Fire In Flight',
        description: 'Smoke or burning smell indicates an electrical fire in flight.',
        steps: [
            'STBY BATT Switch - OFF',
            'MASTER Switch (ALT and BAT) - OFF',
            'Cabin Vents - CLOSED (to avoid drafts)',
            'CABIN HT and CABIN AIR Control Knobs - OFF (push full in)',
            'Fire Extinguisher - ACTIVATE (if available)',
        ],
    },
    {
        id: 'fire-cabin',
        title: 'Cabin Fire',
        description: 'A fire develops inside the cabin.',
        steps: [
            'STBY BATT Switch - OFF',
            'MASTER Switch (ALT and BAT) - OFF',
            'Cabin Vents - CLOSED (to avoid drafts)',
            'CABIN HT and CABIN AIR Control Knobs - OFF (push full in)',
            'Fire Extinguisher - ACTIVATE (if available)',
        ],
    },
    {
        id: 'fire-wing',
        title: 'Wing Fire',
        description: 'A fire is observed on the wing.',
        steps: [
            'LAND and TAXI Light Switches - OFF',
            'NAV Light Switch - OFF',
            'STROBE Light Switch - OFF',
            'PITOT HEAT Switch - OFF',
        ],
    },
    {
        id: 'icing',
        title: 'Inadvertent Icing Encounter During Flight',
        description: 'Structural icing begins to accumulate during flight.',
        steps: [
            'PITOT HEAT Switch - ON',
            'Turn back or change altitude (to an OAT less conducive to icing)',
            'CABIN HT Control Knob - ON (pull full out)',
            'Defroster Control Outlets - OPEN (maximum windshield defroster airflow)',
            'CABIN AIR Control Knob - ADJUST (maximum defroster heat and airflow)',
        ],
    },
    {
        id: 'static-source',
        title: 'Static Source Blockage',
        description: 'Erroneous instrument readings are suspected due to a blocked static source.',
        steps: [
            'ALT STATIC AIR Valve - ON (pull full out)',
        ],
    },
    {
        id: 'vacuum-fail',
        title: 'Vacuum System Failure',
        description: 'The LOW VACUUM annunciator comes on.',
        steps: [
            'Vacuum Indicator (VAC) - CHECK EIS ENGINE PAGE (confirm vacuum pointer is in green band limits)',
        ],
    },
    {
        id: 'co-high',
        title: 'High Carbon Monoxide (CO) Level Advisory',
        description: 'The CO LVL HIGH annunciator comes on in flight.',
        steps: [
            'CABIN HT Control Knob - OFF (push full in)',
            'CABIN AIR Control Knob - ON (pull full out)',
            'Cabin Vents - OPEN',
            'Cabin Windows - OPEN (163 KIAS maximum windows open speed)',
        ],
    },
    {
        id: 'comm-failure-vmc',
        title: 'Communication Failure (VMC Conditions)',
        description: 'Two-way radio communication is lost in visual meteorological conditions. Follow the ABC book troubleshooting steps and 7600 squawk.',
        steps: [
            'Verify correct frequency is selected',
            'Try a different frequency for the ATC facility',
            'Check volume and squelch on transceiver',
            'Try the alternate transceiver (if installed)',
            'Switch transponder to code 7600',
            'Check audio control panel switch position',
            'Verify mike is properly plugged into the jack',
            'Try the hand-held mike (if using headsets)',
            'Transmit "TRANSMITTING BLIND" position reports and intentions',
            'Turn on landing lights, beacons, and strobe lighting',
            'Approach aerodrome side-on to runway-in-use at 500 ft above traffic pattern',
            'Carry out standard overhead circuit joining procedure',
            'Rock wings while flying in front of the tower',
            'Watch for tower light signals',
            'Attempt landing on first pass if fuel permits and no tower lights received',
        ],
    },
    {
        id: 'comm-failure-imc',
        title: 'Communication Failure (IMC / IFR Conditions)',
        description: 'Two-way radio communication is lost in instrument meteorological conditions. Continue IFR flight per 14 CFR 91.185.',
        steps: [
            'ROUTE: Fly the route assigned in last ATC clearance',
            'ROUTE: If radar vectored, fly direct to fix/route/airway in vector clearance',
            'ROUTE: If no assigned route, fly route ATC advised may be expected',
            'ROUTE: If none of above, fly the route filed in the flight plan',
            'ALTITUDE: Maintain HIGHEST of: last assigned altitude, minimum IFR altitude, or expected altitude',
            'LEAVE CLEARANCE LIMIT: At fix for approach — commence descent at ETA or expect further clearance time',
            'LEAVE CLEARANCE LIMIT: If not an approach fix — leave at expect further clearance time, proceed to approach fix',
        ],
    },
    {
        id: 'lost-vfr',
        title: 'Lost Procedures (VFR)',
        description: 'The pilot is lost or uncertain of position under VFR conditions.',
        steps: [
            'Try to establish radio contact with any nearby ATC unit equipped with radar or VDF',
            'If unsuccessful — make a PAN call on 121.50 MHz',
            'Consider weather, light remaining, and fuel state',
            'Climb if necessary to enhance visual and radio range',
            'Fly a cardinal heading (N, S, E, or W) toward an identifiable line feature',
            'Fly along the feature until position can be fixed',
            'Divert to nearest suitable airfield',
        ],
    },
];
