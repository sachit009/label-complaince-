import { CommunityDiscussion, Huddle } from '../types';

export const COMMUNITY_DISCUSSIONS: CommunityDiscussion[] = [
  {
    id: 'disc-1',
    author: {
      name: 'Adv. Rajeshwari Iyer',
      role: 'Senior Metrology Counsel',
      org: 'LegalMetrology Bar Council',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      badge: 'Legal Metrology Expert'
    },
    title: 'Supreme Court ruling on Rule 6(1)(e) Unit Sale Price enforcement on multi-pack bundled goods',
    category: 'Rule 6(1) Declarations',
    content: 'In the recent landmark judgment regarding e-commerce and retail bundled items, the court clarified that each individual unit in a blister or multipack sachet must carry its own explicit Unit Sale Price (USP) per gram or millilitre if sold separately, or aggregate USP if non-severable. Failure will attract compounding notices under Section 36.',
    votes: 142,
    commentsCount: 38,
    hasOfficialVerdict: true,
    legalCitation: 'Civil Appeal No. 4912/2024, Supreme Court of India',
    timestamp: '2 hours ago',
    tags: ['Rule 6(1)(e)', 'Unit Sale Price', 'Supreme Court', 'Bundles'],
    isPinned: true
  },
  {
    id: 'disc-2',
    author: {
      name: 'Dr. Vikramaditya Sen',
      role: 'VP Quality & Regulatory Compliance',
      org: 'Hindustan Consumer Care Corp',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      badge: 'Industry Fellow'
    },
    title: 'Font size ratio compliance on cylindrical bottles vs. principal display panel area calculation',
    category: 'Rule 6(1) Declarations',
    content: 'For cylindrical containers with diameter < 50mm, 40% of the surface area is designated as the Principal Display Panel (PDP). Under Table 1 Rule 9, if PDP is between 50 cm² and 100 cm², minimum numeral height for Net Quantity must be 2.5mm. We observed automated OCR models frequently fail to calculate curve distortion unless unwarping DSP algorithms are engaged.',
    votes: 89,
    commentsCount: 24,
    legalCitation: 'Rule 9(3) & Table 1, Legal Metrology (Packaged Commodities) Rules 2011',
    timestamp: '5 hours ago',
    tags: ['Cylindrical PDP', 'Font Height', 'Rule 9', 'Computer Vision']
  },
  {
    id: 'disc-3',
    author: {
      name: 'Kavita Menon',
      role: 'Lead ML Engineer (OCR & Vision)',
      org: 'Statutory Metrology Labs',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      badge: 'Core Contributor'
    },
    title: 'Benchmark: FastAPI + TrOCR vs Gemini Vision for high-speed conveyor label inspection',
    category: 'OCR & Algorithms',
    content: 'We benchmarked 5,000 FMCG carton labels on an industrial 120 pack/min packaging line. TrOCR achieved 42ms on on-prem RTX 4090 with 97.4% accuracy on blurry lot numbers, while multimodal LLM with JSON structured outputs detected missing customer grievance email domains with 99.8% precision. Combining both yields zero compounding penalties.',
    votes: 114,
    commentsCount: 31,
    legalCitation: 'Metrology Lab Benchmark Paper 2025/11',
    timestamp: 'Yesterday',
    tags: ['FastAPI', 'TrOCR', 'Gemini Vision', 'Latency', 'Industrial AI']
  },
  {
    id: 'disc-4',
    author: {
      name: 'Arunav Mukherjee',
      role: 'Director of Legal Affairs',
      org: 'Apex Retail Brands Federation',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      badge: 'Govt Liaison'
    },
    title: 'Notice regarding Section 32 compounding fee revisions across Western Zone States',
    category: 'Enforcement & Penalties',
    content: 'Metrology controllers in Maharashtra, Gujarat, and Goa have initiated synchronized physical warehouse audits targeting imported electronics missing the Month & Year of Import or Country of Origin in English/Hindi. First offence compounding fees have been fixed at ₹25,000 per SKU.',
    votes: 76,
    commentsCount: 19,
    legalCitation: 'Notification No. LM-882/Enforce/WZ/2025',
    timestamp: '2 days ago',
    tags: ['Section 32', 'Compounding', 'Imports', 'Audits']
  }
];

export const LIVE_HUDDLES: Huddle[] = [
  {
    id: 'hud-1',
    title: 'E-Commerce Marketplace Compliance Audit Live Q&A',
    host: 'Pooja Hegde (E-Com Legal Counsel)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    participants: 48,
    topic: 'Digital Principal Display Panel mandatory disclosures for Amazon & Flipkart sellers',
    live: true
  },
  {
    id: 'hud-2',
    title: 'Ayush & Herbal Labeling PCR 2011 Masterclass',
    host: 'Dr. S. K. Namboodiri',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    participants: 32,
    topic: 'Ayurvedic Proprietary Medicine net mass declarations vs Pharmacopoeia standards',
    live: true
  }
];

export const FONT_HEIGHT_STANDARDS = [
  { pdpArea: 'Area ≤ 50 cm²', minNumHeight: '1.0 mm (Blister) / 1.5 mm (Normal)', minLetterHeight: '1.0 mm' },
  { pdpArea: '50 cm² < Area ≤ 100 cm²', minNumHeight: '2.0 mm', minLetterHeight: '1.5 mm' },
  { pdpArea: '100 cm² < Area ≤ 500 cm²', minNumHeight: '4.0 mm', minLetterHeight: '2.0 mm' },
  { pdpArea: '500 cm² < Area ≤ 2500 cm²', minNumHeight: '6.0 mm', minLetterHeight: '3.0 mm' },
  { pdpArea: 'Area > 2500 cm²', minNumHeight: '8.0 mm', minLetterHeight: '4.0 mm' }
];
