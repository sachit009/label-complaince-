"""
High-Performance HTTP API & Static Server for Legal Metrology Label Scanner (LM Scan).
Runs on Python 3 standard library with zero external dependency requirements.
"""

import sys
import os
import json
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import urllib.parse

from compliance_engine import ComplianceEngine, LEGAL_RULES, STATUTORY_PENALTIES
import db

PORT = 8080
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

engine = ComplianceEngine(gemini_api_key=os.environ.get('GEMINI_API_KEY'))


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in separate threads for maximum throughput."""
    daemon_threads = True


class LMScanHandler(BaseHTTPRequestHandler):

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')

    def send_json(self, data, status=200, is_head=False):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        if not is_head:
            self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_HEAD(self):
        self.do_GET(is_head=True)

    def do_GET(self, is_head=False):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # API Endpoints
        if path == '/api/scans':
            search = query.get('search', [''])[0]
            status_filter = query.get('status', [''])[0]
            limit = int(query.get('limit', [100])[0])
            scans = db.list_scans(limit=limit, search=search, status_filter=status_filter)
            stats = db.get_analytics_summary()
            self.send_json({'scans': scans, 'stats': stats})
            return

        elif path.startswith('/api/scans/'):
            try:
                scan_id = int(path.split('/')[-1])
                scan = db.get_scan(scan_id)
                if scan:
                    self.send_json(scan)
                else:
                    self.send_json({'error': f'Scan #{scan_id} not found'}, status=404)
            except ValueError:
                self.send_json({'error': 'Invalid scan ID'}, status=400)
            return

        elif path == '/api/rules':
            self.send_json({
                'rules': LEGAL_RULES,
                'statutoryPenalties': STATUTORY_PENALTIES,
                'governingLaw': 'Legal Metrology (Packaged Commodities) Rules, 2011 & 2022 Amendments',
                'enforcingAuthority': 'Department of Consumer Affairs, Ministry of Consumer Affairs, Food and Public Distribution, Govt. of India'
            })
            return

        elif path == '/api/samples':
            self.send_json(self.get_sample_catalog())
            return

        elif path == '/api/stats':
            self.send_json(db.get_analytics_summary())
            return

        # Static File Serving
        self.serve_static_file(path, is_head=is_head)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/scan':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)

                image = payload.get('image', '')
                thumbnail = payload.get('thumbnail', '')
                api_key = payload.get('apiKey') or self.headers.get('X-API-Key')
                hint = payload.get('hint', '')

                if not image and not hint:
                    self.send_json({'error': 'No image data or label text provided'}, status=400)
                    return

                # Evaluate compliance
                result = engine.evaluate_label(image_base64=image, api_key=api_key, prompt_hint=hint)
                
                # Save to database
                db.save_scan(result, thumbnail=thumbnail or image[:2000] if image else None)
                
                result['thumbnail'] = thumbnail
                self.send_json(result)

            except Exception as e:
                print(f"[Server Error in /api/scan]: {e}")
                self.send_json({'error': f'Scan processing error: {str(e)}'}, status=500)
            return

        elif path == '/api/report':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)
                html_report = self.generate_html_certificate(payload)
                self.send_json({'html': html_report})
            except Exception as e:
                self.send_json({'error': str(e)}, status=500)
            return

        self.send_json({'error': 'Not Found'}, status=404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/scans':
            db.clear_all_scans()
            self.send_json({'success': True, 'message': 'All scans cleared'})
            return

        elif path.startswith('/api/scans/'):
            try:
                scan_id = int(path.split('/')[-1])
                deleted = db.delete_scan(scan_id)
                if deleted:
                    self.send_json({'success': True, 'id': scan_id})
                else:
                    self.send_json({'error': 'Scan not found'}, status=404)
            except ValueError:
                self.send_json({'error': 'Invalid scan ID'}, status=400)
            return

        self.send_json({'error': 'Not Found'}, status=404)

    def serve_static_file(self, path, is_head=False):
        if path in ('/', ''):
            path = '/index.html'

        # Sanitize path to prevent directory traversal
        rel_path = path.lstrip('/')
        file_path = os.path.normpath(os.path.join(STATIC_DIR, rel_path))

        if not file_path.startswith(STATIC_DIR) or not os.path.exists(file_path) or os.path.isdir(file_path):
            file_path = os.path.join(STATIC_DIR, 'index.html')

        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = 'application/octet-stream'

        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
            self.send_cors_headers()
            self.end_headers()
            if not is_head:
                self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            if not is_head:
                self.wfile.write(f"Error reading file: {e}".encode('utf-8'))

    def get_sample_catalog(self):
        return [
            {
                "id": "sample-maggi",
                "name": "Maggi 2-Minute Noodles (Compliant)",
                "category": "FMCG / Food",
                "expectedStatus": "compliant",
                "description": "Standard Indian food package complying with all 6 mandatory rules + Unit Sale Price + FSSAI.",
                "hintText": """MAGGI 2-MINUTE NOODLES - MASALA
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
Batch No: 42180452BA"""
            },
            {
                "id": "sample-noncompliant-mrp",
                "name": "Artisan Cookies (Missing Tax Clause & Invalid Units)",
                "category": "Bakery / Non-Compliant",
                "expectedStatus": "non_compliant",
                "description": "Fails Rule 6(1)(c) with illegal unit '150 gms' and fails Rule 6(1)(e) omitting '(inclusive of all taxes)'.",
                "hintText": """CHEF'S DELIGHT CRANBERRY COOKIES
Manufactured & Marketed by: Delight Bakery Works, Gala 4, MIDC Andheri East, Mumbai 400093.
Net Wt: 150 gms
Mfg Date: 07/2026
MRP: Rs 120.00
Customer Feedback: contact@delightbakery.in
Batch: CR-89"""
            },
            {
                "id": "sample-imported-tea",
                "name": "Premium Green Tea (Missing Importer & Consumer Care)",
                "category": "Beverage / Import Non-Compliant",
                "expectedStatus": "non_compliant",
                "description": "Imported commodity missing mandatory importer address and helpline phone number.",
                "hintText": """ZEN MATCHA GREEN TEA
Product of Japan
Generic Name: Green Tea Powder
Net Volume: 100 g
Packed: Jun 2026
MRP ₹ 850.00 (incl. of all taxes)
USP ₹ 8.50 / g"""
            },
            {
                "id": "sample-colgate",
                "name": "Colgate Strong Teeth (Fully Compliant)",
                "category": "Personal Care",
                "expectedStatus": "compliant",
                "description": "Compliant FMCG personal care toothpaste label with complete manufacturer, customer care, and metric units.",
                "hintText": """COLGATE STRONG TEETH TOOTHPASTE
Marketed by: Colgate-Palmolive (India) Limited, Colgate Research Centre, Main Street, Hiranandani Gardens, Powai, Mumbai - 400076.
Mfg by: Plot No. 1, Industrial Area, Baddi, Solan, H.P. - 173205.
Generic Name: Toothpaste
Net Quantity: 150 g
Month & Year of Mfg: 09/2026
MRP ₹ 115.00 (inclusive of all taxes)
Unit Sale Price: ₹ 0.77 / g
Consumer Care: Colgate-Palmolive (India) Ltd., Consumer Care Manager, Powai, Mumbai 400076.
Toll Free: 1800-225-599 | Email: consumeraffairs_india@colpal.com
Batch No: CB8912"""
            }
        ]

    def generate_html_certificate(self, scan_data):
        """Generates a formal Legal Metrology Compliance Inspection Audit Report."""
        scan_id = scan_data.get('id', 'N/A')
        pname = scan_data.get('productName', 'Packaged Commodity')
        status = scan_data.get('status', 'needs_review').upper().replace('_', ' ')
        score = scan_data.get('totalScore', 0)
        created_at = scan_data.get('createdAt', '')
        summary = scan_data.get('summary', '')
        fields = scan_data.get('fields', [])

        rows_html = ""
        for f in fields:
            v_color = "#16a34a" if f['verdict'] == 'pass' else ("#dc2626" if f['verdict'] == 'fail' else "#ca8a04")
            v_label = "PASS (Present)" if f['verdict'] == 'pass' else ("FAIL (Violation)" if f['verdict'] == 'fail' else "REVIEW (Advisory)")
            issues_str = f"<br><span style='color:#dc2626; font-size:11px;'>⚠️ {'; '.join(f['issues'])}</span>" if f['issues'] else ""
            val_str = f['value'] or "<em style='color:#9ca3af;'>Not declared on label</em>"
            
            rows_html += f"""
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px; font-family: monospace; font-size: 12px; vertical-align: top;"><strong>{f['rule']}</strong></td>
                <td style="padding: 10px; font-size: 13px; vertical-align: top;">
                    <strong>{f['label']}</strong>
                    <div style="color: #4b5563; margin-top: 4px; font-family: monospace; font-size: 12px;">{val_str}</div>
                    {issues_str}
                </td>
                <td style="padding: 10px; text-align: center; vertical-align: top;">
                    <span style="display:inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: white; background: {v_color};">
                        {v_label}
                    </span>
                </td>
            </tr>
            """

        status_badge_bg = "#16a34a" if status == "COMPLIANT" else ("#dc2626" if "NON" in status else "#ca8a04")

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Legal Metrology Inspection Certificate — #{scan_id}</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; background: #fff; }}
                .cert-box {{ max-width: 800px; margin: 0 auto; border: 2px solid #1f2937; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }}
                .header {{ text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 25px; }}
                .badge {{ background: {status_badge_bg}; color: white; padding: 6px 16px; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 14px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th {{ background: #f3f4f6; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #d1d5db; }}
                .footer {{ border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 30px; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between; }}
                @media print {{ body {{ padding: 0; }} .cert-box {{ border: 1px solid #000; box-shadow: none; }} }}
            </style>
        </head>
        <body>
            <div class="cert-box">
                <div class="header">
                    <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Government of India · Ministry of Consumer Affairs</div>
                    <h1 style="margin: 6px 0 2px; font-size: 22px;">LEGAL METROLOGY COMPLIANCE AUDIT REPORT</h1>
                    <div style="font-size: 13px; color: #4b5563;">Packaged Commodities Rules, 2011 & Amendments Verification</div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; background: #f9fafb; padding: 15px; border-radius: 6px;">
                    <div>
                        <div style="font-size: 11px; color: #6b7280; text-transform: uppercase;">Product / Commodity</div>
                        <div style="font-size: 18px; font-weight: bold; margin: 2px 0 6px;">{pname}</div>
                        <div style="font-size: 12px; color: #4b5563;">Inspection ID: <strong>#{scan_id}</strong> · Date: {created_at}</div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge">{status}</span>
                        <div style="font-size: 12px; margin-top: 6px; font-weight: 600;">Compliance Score: {score}%</div>
                    </div>
                </div>

                <div style="margin-bottom: 15px; font-size: 13px; line-height: 1.5; padding: 12px; background: #fefce8; border-left: 4px solid #ca8a04; border-radius: 4px;">
                    <strong>Executive Finding:</strong> {summary}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 15%;">Rule Ref</th>
                            <th style="width: 60%;">Mandatory Declaration & Extracted Details</th>
                            <th style="width: 25%; text-align: center;">Audit Verdict</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows_html}
                    </tbody>
                </table>

                <div style="font-size: 12px; line-height: 1.5; color: #4b5563; margin-top: 15px;">
                    <strong>Statutory Note:</strong> Under Section 36(1) of the Legal Metrology Act, 2009, manufacturing, packing, importing, or distributing non-compliant packaged commodities carries penalties up to ₹25,000 for the first offence, ₹50,000 for the second offence, and ₹1,00,000 or imprisonment for subsequent offences.
                </div>

                <div class="footer">
                    <div>Generated via LM Scan Automated Audit System</div>
                    <div>Page 1 of 1 · Verified under Legal Metrology Act, 2009</div>
                </div>
            </div>
            <script>window.onload = function() {{ window.print(); }}</script>
        </body>
        </html>
        """


def run():
    db.init_db()
    server_address = ('', PORT)
    httpd = ThreadedHTTPServer(server_address, LMScanHandler)
    print(f"🚀 Legal Metrology Scanner Server running at http://localhost:{PORT}")
    print(f"📁 Serving static assets from {STATIC_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server shutting down...")
        httpd.server_close()


if __name__ == '__main__':
    run()
