export type RuleStatus = 'pass' | 'fail' | 'warning';

export interface BoundingBox {
  top: number; // percentage (0-100)
  left: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
}

export interface RuleAuditItem {
  id: string; // e.g. "6(1)(a)"
  subClause: string;
  name: string;
  category: string;
  statutoryRequirement: string;
  extractedValue: string;
  status: RuleStatus;
  confidence: number;
  bbox: BoundingBox;
  measuredFontHeightMm: number;
  minimumFontHeightMm: number;
  statutoryPenalty: string;
  legalPrecedent: string;
}

export interface AuditPreset {
  id: string;
  name: string;
  brand: string;
  category: string;
  sampleCode: string;
  imageUrl: string;
  isCompliant: boolean;
  complianceScore: number;
  overallVerdict: 'COMPLIANT' | 'NON-COMPLIANT' | 'CONDITIONAL_REVIEW';
  ocrLatencyMs: number;
  rules: RuleAuditItem[];
  rawOcrTokens: { text: string; confidence: number; bbox: BoundingBox }[];
}

export interface CommunityDiscussion {
  id: string;
  author: {
    name: string;
    role: string;
    org: string;
    avatar: string;
    badge?: string;
  };
  title: string;
  category: 'Rule 6(1) Declarations' | 'OCR & Algorithms' | 'Enforcement & Penalties' | 'E-Commerce Guidelines';
  content: string;
  votes: number;
  commentsCount: number;
  hasOfficialVerdict?: boolean;
  legalCitation: string;
  timestamp: string;
  tags: string[];
  isPinned?: boolean;
}

export interface Huddle {
  id: string;
  title: string;
  host: string;
  avatar: string;
  participants: number;
  topic: string;
  live: boolean;
}

export interface CameraSettings {
  evExposure: number; // -2 to +2
  magnification: number; // 1.0, 2.0, 4.0
  focusMode: 'AF-C' | 'MACRO-OCR' | 'MANUAL';
  ledRing: 0 | 45 | 100; // %
  spectralCalibration: '5500K D65' | 'FL-4100K' | 'TUNGSTEN 3200K';
  complianceArchetype: 'Rigid Container / Box' | 'Blister Pack' | 'Flexible Pouch / Sachet' | 'Cylindrical Bottle';
  showBoundingBoxes: boolean;
  showReticle: boolean;
}
