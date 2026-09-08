/**
 * Sample Packaged Commodity Test Cases
 * Realistic Indian FMCG labels for instant compliance validation testing.
 */

window.SAMPLE_CATALOG = [
  {
    id: "sample-maggi",
    name: "Maggi 2-Minute Noodles",
    category: "FMCG / Food",
    expectedStatus: "compliant",
    badgeText: "Compliant (6/6)",
    badgeClass: "compliant",
    description: "Standard compliant FMCG food packaging under Rule 6(1) + Unit Sale Price (USP) + FSSAI.",
    hintText: `MAGGI 2-MINUTE NOODLES - MASALA
Manufactured by: Nestlé India Limited, 100/101 World Trade Centre, Barakhamba Lane, New Delhi - 110001.
At: Plot No. 294-297, Usgao, Ponda, Goa - 403407.
Country of Origin: India.
Generic Name: Instant Noodles with Seasoning
Net Quantity: 70 g
Month & Year of Manufacture: MFD 08/2026
Best Before 9 months from manufacture
MRP ₹ 14.00 (inclusive of all taxes)
Unit Sale Price: ₹ 0.20 / g
Consumer Care: Contact Nestlé Consumer Care Executive, P.O. Box 11, New Delhi - 110001.
Tel: 1800-103-1947 | Email: wecare@in.nestle.com
FSSAI Lic. No. 10012011000168
100% Vegetarian (Green Dot Symbol)
Batch No: 42180452BA`
  },
  {
    id: "sample-noncompliant-mrp",
    name: "Artisan Cranberry Cookies",
    category: "Bakery / Violation",
    expectedStatus: "non_compliant",
    badgeText: "Violations (4/6)",
    badgeClass: "non_compliant",
    description: "Fails Rule 6(1)(c) with illegal unit symbol '150 gms' and fails Rule 6(1)(e) omitting 'inclusive of all taxes'.",
    hintText: `CHEF'S DELIGHT CRANBERRY COOKIES
Manufactured & Marketed by: Delight Bakery Works, Gala 4, MIDC Andheri East, Mumbai 400093.
Net Wt: 150 gms
Mfg Date: 07/2026
MRP: Rs 120.00
Customer Feedback: contact@delightbakery.in
Batch: CR-89`
  },
  {
    id: "sample-imported-tea",
    name: "Zen Matcha Green Tea",
    category: "Imported Commodity",
    expectedStatus: "non_compliant",
    badgeText: "Violations (3/6)",
    badgeClass: "non_compliant",
    description: "Imported item missing mandatory name & address of Indian Importer and consumer helpline telephone.",
    hintText: `ZEN MATCHA GREEN TEA
Product of Japan
Generic Name: Green Tea Powder
Net Volume: 100 g
Packed: Jun 2026
MRP ₹ 850.00 (incl. of all taxes)
USP ₹ 8.50 / g`
  },
  {
    id: "sample-colgate",
    name: "Colgate Strong Teeth",
    category: "Personal Care",
    expectedStatus: "compliant",
    badgeText: "Compliant (6/6)",
    badgeClass: "compliant",
    description: "Standard personal care toothpaste compliant with metric SI units, MRP, and consumer grievance officer.",
    hintText: `COLGATE STRONG TEETH TOOTHPASTE
Marketed by: Colgate-Palmolive (India) Limited, Colgate Research Centre, Main Street, Hiranandani Gardens, Powai, Mumbai - 400076.
Mfg by: Plot No. 1, Industrial Area, Baddi, Solan, H.P. - 173205.
Generic Name: Toothpaste
Net Quantity: 150 g
Month & Year of Mfg: 09/2026
MRP ₹ 115.00 (inclusive of all taxes)
Unit Sale Price: ₹ 0.77 / g
Consumer Care: Colgate-Palmolive (India) Ltd., Consumer Care Manager, Powai, Mumbai 400076.
Toll Free: 1800-225-599 | Email: consumeraffairs_india@colpal.com
Batch No: CB8912`
  }
];

// Helper to generate canvas graphic for sample
window.generateSampleCanvas = function(sample) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 600, 450);
  bgGrad.addColorStop(0, '#1e293b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 600, 450);

  // Label Card Box
  ctx.fillStyle = '#ffffff';
  ctx.roundRect ? ctx.roundRect(40, 30, 520, 390, 8) : ctx.fillRect(40, 30, 520, 390);
  ctx.fill();

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Print Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('DECLARATION PANEL / PACKAGED COMMODITY', 60, 65);

  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(60, 75);
  ctx.lineTo(540, 75);
  ctx.stroke();

  // Print lines of sample text
  ctx.fillStyle = '#1e293b';
  ctx.font = '11px monospace';
  const lines = sample.hintText.split('\n');
  let y = 98;
  for (let i = 0; i < Math.min(lines.length, 16); i++) {
    const line = lines[i];
    if (line.includes('MAGGI') || line.includes('COLGATE') || line.includes('CHEF') || line.includes('ZEN')) {
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#1e40af';
      ctx.fillText(line, 60, y);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#1e293b';
    } else {
      ctx.fillText(line.substring(0, 65), 60, y);
    }
    y += 19;
  }

  // Barcode mockup at bottom right
  ctx.fillStyle = '#000000';
  let bx = 420;
  const bw = [2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 4, 2, 1, 3];
  for (let b of bw) {
    ctx.fillRect(bx, 370, b, 30);
    bx += b + 2;
  }

  return canvas.toDataURL('image/jpeg', 0.88);
};
