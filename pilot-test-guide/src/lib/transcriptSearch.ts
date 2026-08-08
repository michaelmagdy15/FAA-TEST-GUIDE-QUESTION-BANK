import { LECTURES, CATEGORY_TO_LECTURES, Lecture } from '../data/lectureMap';

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface TranscriptData {
  videoId: string;
  lectureNum: number;
  title: string;
  topics: string[];
  segments: TranscriptSegment[];
}

export interface LectureReference {
  lecture: Lecture;
  timestamp: number;
  context: string;
  relevance: 'high' | 'medium';
}

const transcriptCache: Map<number, TranscriptData> = new Map();
const loadedLectures = new Set<number>();

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---- Aviation-aware keyword extraction ----

const AVIATION_KEYWORDS: Record<string, number> = {
  // High-value specific terms (weight 3)
  carburetor: 3, carb: 3, icing: 3,
  stall: 3, stalls: 3, stalling: 3, buffet: 3, 'angle of attack': 3,
  'load factor': 3, maneuvering: 3,
  'center of gravity': 3, cg: 3,
  'density altitude': 3,
  'visual flight': 3, vfr: 3, ifr: 3, 'instrument flight': 3,
  'class b': 3, 'class c': 3, 'class d': 3, 'class e': 3, 'class g': 3, 'class a': 3,
  airspace: 2, 'special use': 2, tfr: 2, 'temporary flight restriction': 2,
  vor: 3, vortac: 3, 'vor/dme': 3, gps: 2, 'flight planning': 2,
  'weight and balance': 3, moment: 2,
  'power curve': 3, 'power required': 3,
  'ground effect': 3, 'induced drag': 3,
  'true airspeed': 3, 'indicated airspeed': 3, 'calibrated airspeed': 3,
  metar: 3, taf: 3, 'weather briefing': 2, 'aviation weather': 2,
  thunderstorm: 3, 'wind shear': 3, microburst: 3, fog: 2,
  visibility: 2, 'cloud clearance': 3, 'weather minimums': 3,
  'flight instruments': 2, altimeter: 2, 'turn coordinator': 2,
  'attitude indicator': 2, 'heading indicator': 2, 'vertical speed': 2,
  pitot: 2, static: 2, 'pitot-static': 3,
  'emergency procedures': 2, 'emergency landing': 2, 'forced landing': 3,
  'best glide': 3, 'best glide speed': 3, vg: 3, vy: 2, vx: 2,
  'night flying': 2, 'night flight': 2, 'night vfr': 2,
  'cross country': 2, pilotage: 2, 'dead reckoning': 3,
  'human factors': 2, adm: 2, 'aeronautical decision making': 3, imsafe: 3,
  'hazardous attitudes': 3, 'sterile cockpit': 2,
  'aircraft ownership': 2, maintenance: 2, '100-hour': 2, annual: 2,
  airworthiness: 2, 'airworthiness certificate': 3,
  'aircraft systems': 2, engine: 1, fuel: 1, electrical: 1, oil: 1,
  propeller: 2, 'constant speed': 2, 'fixed pitch': 2,
  'takeoff performance': 2, 'landing performance': 2, runway: 1,
  'performance charts': 2, 'performance data': 2,
  multiengine: 2, vmc: 3, 'critical engine': 3,
  seaplane: 2, floatplane: 2, drone: 2, suas: 2,
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'don', 'now', 'and', 'but', 'or', 'if', 'while', 'that', 'which',
  'who', 'whom', 'this', 'these', 'those', 'what', 'about', 'up',
  'also', 'however', 'therefore', 'thus', 'hence', 'still', 'yet',
  'already', 'even', 'much', 'many', 'well', 'back', 'get', 'go',
  'know', 'like', 'make', 'say', 'see', 'think', 'take', 'come',
  'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem',
  'feel', 'try', 'leave', 'call', 'let', 'keep', 'help', 'show',
  'hear', 'play', 'run', 'move', 'live', 'believe', 'bring', 'happen',
  'must', 'sure', 'every', 'thing', 'things', 'one', 'two', 'three',
  'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'first',
  'second', 'new', 'old', 'good', 'bad', 'big', 'small', 'great',
  'long', 'high', 'low', 'right', 'left', 'important', 'different',
  'possible', 'whole', 'understand', 'problem', 'point', 'during',
  'mean', 'because', 'another', 'enough', 'look', 'become', 'without',
  'since', 'among', 'across', 'never', 'always', 'often', 'sometimes',
  'usually', 'really', 'actually', 'probably', 'certainly', 'basically',
  'simply', 'perhaps', 'maybe', 'rather', 'quite', 'almost', 'less',
  'least', 'far', 'near', 'nearby', 'away', 'around', 'toward',
  'towards', 'within', 'without', 'upon', 'against', 'something',
  'anything', 'everything', 'nothing', 'someone', 'anyone', 'everyone',
  'nobody', 'way', 'day', 'time', 'year', 'people', 'man', 'woman',
  'child', 'world', 'life', 'hand', 'part', 'place', 'case', 'week',
  'company', 'system', 'program', 'question', 'work', 'government',
  'number', 'night', 'home', 'water', 'room', 'mother', 'area', 'money',
  'story', 'fact', 'month', 'lot', 'study', 'book', 'eye', 'job', 'word',
  'business', 'issue', 'side', 'kind', 'head', 'house', 'service',
  'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'members',
  'city', 'community', 'name', 'president', 'team', 'minute', 'idea',
  'body', 'information', 'river', 'parent', 'face', 'others', 'level',
  'office', 'door', 'health', 'person', 'art', 'car', 'war', 'history',
  'party', 'result', 'change', 'morning', 'reason', 'research', 'girl',
  'guy', 'moment', 'air', 'force', 'teacher', 'education', 'report',
  'food', 'state', 'family', 'group', 'country', 'problem', 'school',
  'student', 'class', 'test', 'chapter', 'answer', 'correct', 'wrong',
  'true', 'false', 'example', 'including', 'called', 'known', 'defined',
  'means', 'refers', 'indicates', 'describes', 'states', 'according',
  'regulation', 'far', 'requirement', 'shall', 'prohibited', 'required',
  'authorized', 'approved', 'standard', 'normal', 'utility', 'acrobatic',
  'category', 'certificate', 'rating', 'endorsement', 'privilege',
  'limitation', 'condition', 'within', 'outside', 'minimum', 'maximum',
  'exceed', 'greater', 'exceeding', 'aircraft', 'airplane', 'pilot',
  'flight', 'pilot', 'operation', 'operating', 'airman', 'airmen',
]);

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const scored: Record<string, number> = {};

  // Check for multi-word aviation terms first
  for (const [term, weight] of Object.entries(AVIATION_KEYWORDS)) {
    if (term.length > 3 && lower.includes(term)) {
      scored[term] = (scored[term] || 0) + weight;
    }
  }

  // Score individual words
  for (const w of words) {
    if (w.length > 2 && !STOP_WORDS.has(w)) {
      const aviationWeight = AVIATION_KEYWORDS[w] || 0;
      scored[w] = (scored[w] || 0) + Math.max(1, aviationWeight);
    }
  }

  return Object.entries(scored)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

function scoreSegment(keywords: string[], segmentText: string): { score: number; matchCount: number } {
  const lower = segmentText.toLowerCase();
  let score = 0;
  let matchCount = 0;
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) {
      matchCount++;
      const weight = AVIATION_KEYWORDS[kw] || 1;
      score += matches.length * weight;
    }
  }
  return { score, matchCount };
}

function extractContext(segments: TranscriptSegment[], bestIdx: number): string {
  const start = Math.max(0, bestIdx - 1);
  const end = Math.min(segments.length, bestIdx + 3);
  const texts = segments.slice(start, end).map(s => s.text);

  // Find a clean sentence boundary for the context
  let context = texts.join(' ');
  if (context.length > 250) {
    context = context.slice(0, 250);
    // Try to end at a sentence boundary
    const lastPeriod = context.lastIndexOf('.');
    if (lastPeriod > 100) {
      context = context.slice(0, lastPeriod + 1);
    } else {
      context += '...';
    }
  }
  return context;
}

// ---- Explicit topic mappings for common question patterns ----

interface TopicMapping {
  keywords: string[];
  lectures: { num: number; timeHint?: number }[];
}

const TOPIC_MAPPINGS: TopicMapping[] = [
  // Carburetor ice
  { keywords: ['carburetor', 'carb', 'ice', 'icing', 'carburetor ice', 'rpm', 'carburetor heat'],
    lectures: [{ num: 4, timeHint: 1800 }] },
  // Stall
  { keywords: ['stall', 'stalls', 'stalling', 'stall warning', 'buffet', 'mush'],
    lectures: [{ num: 2, timeHint: 2400 }, { num: 3, timeHint: 1200 }] },
  // Load factor / maneuvers
  { keywords: ['load factor', 'bank', 'steep turn', 'steep bank', 'maneuvering speed'],
    lectures: [{ num: 2, timeHint: 3000 }] },
  // Density altitude
  { keywords: ['density altitude', 'high density', 'performance', 'takeoff distance', 'climb performance'],
    lectures: [{ num: 6, timeHint: 1800 }, { num: 12, timeHint: 600 }] },
  // VFR minimums / weather minimums
  { keywords: ['vfr', 'visual flight', 'visibility', 'cloud clearance', 'weather minimums', 'vfr minimums'],
    lectures: [{ num: 21, timeHint: 600 }, { num: 5, timeHint: 1200 }] },
  // Airspace classes
  { keywords: ['class b', 'class c', 'class d', 'class e', 'class g', 'airspace', 'class a'],
    lectures: [{ num: 5, timeHint: 600 }] },
  // VOR / navigation
  { keywords: ['vor', 'radial', 'vor/dme', 'vortac', 'navigation', 'bearing', 'cdi', 'obs'],
    lectures: [{ num: 7, timeHint: 600 }] },
  // Weight and balance
  { keywords: ['weight and balance', 'center of gravity', 'cg', 'moment', 'loading'],
    lectures: [{ num: 18, timeHint: 600 }] },
  // METAR / TAF
  { keywords: ['metar', 'taf', 'weather report', 'weather observation', 'weather forecast'],
    lectures: [{ num: 13, timeHint: 600 }, { num: 9, timeHint: 1800 }] },
  // Thunderstorms / weather hazards
  { keywords: ['thunderstorm', 'wind shear', 'microburst', 'turbulence', 'icing', 'convective'],
    lectures: [{ num: 9, timeHint: 1200 }] },
  // Emergency procedures
  { keywords: ['emergency', 'forced landing', 'engine failure', 'best glide', 'emergency landing'],
    lectures: [{ num: 3, timeHint: 1800 }, { num: 14, timeHint: 1200 }] },
  // Human factors / ADM
  { keywords: ['human factors', 'aeronautical decision', 'adm', 'imsafe', 'hazardous attitude', 'risk management'],
    lectures: [{ num: 14, timeHint: 600 }] },
  // Flight instruments
  { keywords: ['altimeter', 'turn coordinator', 'attitude indicator', 'heading indicator', 'pitot', 'static', 'gyroscopic'],
    lectures: [{ num: 4, timeHint: 2400 }] },
  // Night flying
  { keywords: ['night', 'night flying', 'night vfr', 'night flight', 'night operations'],
    lectures: [{ num: 20, timeHint: 600 }] },
  // Cross country / flight planning
  { keywords: ['cross country', 'flight plan', 'flight planning', 'navigation log', 'pilotage', 'dead reckoning'],
    lectures: [{ num: 15, timeHint: 600 }, { num: 7, timeHint: 1200 }] },
  // Aircraft maintenance / airworthiness
  { keywords: ['maintenance', 'airworthiness', 'annual inspection', '100-hour', 'ad', 'airworthiness certificate'],
    lectures: [{ num: 11, timeHint: 600 }] },
  // Multiengine
  { keywords: ['multiengine', 'vmc', 'critical engine', 'asymmetric', 'multi-engine'],
    lectures: [{ num: 19, timeHint: 600 }] },
  // Seaplanes
  { keywords: ['seaplane', 'floatplane', 'water landing', 'water operations'],
    lectures: [{ num: 16, timeHint: 600 }] },
  // Drone / sUAS
  { keywords: ['drone', 'suas', 'part 107', 'remote pilot', 'unmanned'],
    lectures: [{ num: 17, timeHint: 600 }] },
];

function findTopicMapping(text: string): { num: number; timeHint?: number }[] | null {
  const lower = text.toLowerCase();
  for (const mapping of TOPIC_MAPPINGS) {
    const matchCount = mapping.keywords.filter(kw => lower.includes(kw)).length;
    if (matchCount >= 2 || (matchCount === 1 && mapping.keywords.some(kw => lower.includes(kw) && kw.length > 5))) {
      return mapping.lectures;
    }
  }
  return null;
}

export async function loadTranscript(lectureNum: number): Promise<TranscriptData | null> {
  if (transcriptCache.has(lectureNum)) return transcriptCache.get(lectureNum)!;
  if (loadedLectures.has(lectureNum)) return null;

  try {
    const mod = await import(`../data/transcripts/lecture_${String(lectureNum).padStart(2, '0')}.json`);
    const data: TranscriptData = mod.default || mod;
    transcriptCache.set(lectureNum, data);
    loadedLectures.add(lectureNum);
    return data;
  } catch {
    loadedLectures.add(lectureNum);
    return null;
  }
}

function findBestSegmentInTranscript(
  transcript: TranscriptData,
  keywords: string[],
  requiredMatches: number = 3
): { score: number; idx: number; matchCount: number } | null {
  let bestScore = 0;
  let bestIdx = 0;
  let bestMatchCount = 0;
  const windowSize = 5; // Larger window for better context matching

  for (let i = 0; i < transcript.segments.length; i++) {
    let windowText = '';
    for (let j = i; j < Math.min(i + windowSize, transcript.segments.length); j++) {
      windowText += ' ' + transcript.segments[j].text;
    }
    const { score, matchCount } = scoreSegment(keywords, windowText);
    // Require minimum keyword overlap AND reasonable score
    if (matchCount >= requiredMatches && score > bestScore) {
      bestScore = score;
      bestIdx = i;
      bestMatchCount = matchCount;
    }
  }

  if (bestMatchCount < requiredMatches) return null;
  return { score: bestScore, idx: bestIdx, matchCount: bestMatchCount };
}

export async function findRelevantSegments(
  questionText: string,
  category: string | undefined,
  explanation?: string,
  correctAnswer?: string,
  topN: number = 3
): Promise<LectureReference[]> {
  // Combine all text for better keyword extraction
  const combinedText = [questionText, explanation || '', correctAnswer || ''].join(' ');
  const keywords = extractKeywords(combinedText);

  // Try explicit topic mapping first
  const topicLectures = findTopicMapping(combinedText);

  // Determine which lectures to search
  const categoryLectures = CATEGORY_TO_LECTURES[category || ''] || [];
  const searchLectures = topicLectures
    ? [...new Set([...topicLectures.map(t => t.num), ...categoryLectures.slice(0, 3)])]
    : categoryLectures;

  if (searchLectures.length === 0) return [];

  const results: LectureReference[] = [];

  for (const num of searchLectures) {
    const transcript = await loadTranscript(num);
    if (!transcript) continue;

    const lecture = LECTURES.find(l => l.num === num);
    if (!lecture) continue;

    const requiredMatches = topicLectures ? 2 : 3;

    const best = findBestSegmentInTranscript(transcript, keywords, requiredMatches);
    if (!best) continue;

    const seg = transcript.segments[best.idx];
    const relevance: 'high' | 'medium' = best.matchCount >= 4 ? 'high' : 'medium';

    results.push({
      lecture,
      timestamp: seg.start,
      context: extractContext(transcript.segments, best.idx),
      relevance,
    });
  }

  // Sort by relevance: topic-mapped lectures first, then by match count
  results.sort((a, b) => {
    const aIsTopic = topicLectures?.some(t => t.num === a.lecture.num) ? 0 : 1;
    const bIsTopic = topicLectures?.some(t => t.num === b.lecture.num) ? 0 : 1;
    if (aIsTopic !== bIsTopic) return aIsTopic - bIsTopic;
    const aRel = a.relevance === 'high' ? 0 : 1;
    const bRel = b.relevance === 'high' ? 0 : 1;
    return aRel - bRel;
  });

  return results.slice(0, topN);
}

export { formatTimestamp };
