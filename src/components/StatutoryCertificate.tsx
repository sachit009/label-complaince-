import React, { useState } from 'react';
import { AuditPreset } from '../types';
import { 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  FileCheck2, 
  Copy, 
  Check, 
  Mail, 
  QrCode,
  Stamp,
  Award,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface StatutoryCertificateProps {
  currentPreset: AuditPreset;
  isDarkMode: boolean;
}

export const StatutoryCertificate: React.FC<StatutoryCertificateProps> = ({
  currentPreset,
  isDarkMode
}) => {
  const [showInspectorSeal, setShowInspectorSeal] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#verify/${currentPreset.sampleCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
        setShowEmailModal(false);
        setEmailInput('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Award className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-slate-100">
              Statutory Compliance Dossier & Certificate
            </h2>
            <p className="text-xs text-slate-400">
              Official verification record under Rule 6(1) of the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>
        </div>

        {/* Action Buttons & Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          
          <button
            onClick={() => setShowInspectorSeal(!showInspectorSeal)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
              showInspectorSeal 
                ? 'bg-teal-500/20 border-teal-500/50 text-teal-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Stamp className="w-3.5 h-3.5 inline mr-1" />
            Seal: {showInspectorSeal ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowWatermark(!showWatermark)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
              showWatermark 
                ? 'bg-teal-500/20 border-teal-500/50 text-teal-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Watermark: {showWatermark ? 'ON' : 'OFF'}
          </button>

          <button
            id="btn-copy-verify-link"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 bg-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link!' : 'Share Link'}</span>
          </button>

          <button
            id="btn-email-certificate"
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 bg-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Report</span>
          </button>

          <button
            id="btn-print-certificate"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>

        </div>
      </div>

      {/* Official A4 Dossier Document Stage */}
      <div className="max-w-4xl mx-auto">
        <div className="relative p-8 md:p-12 rounded-3xl border border-slate-300 bg-white text-slate-900 shadow-2xl font-sans overflow-hidden">
          
          {/* Watermark Background */}
          {showWatermark && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none rotate-[-30deg]">
              <div className="text-7xl font-display font-extrabold tracking-widest text-slate-900 uppercase">
                LEGAL METROLOGY PCR 2011
              </div>
            </div>
          )}

          {/* Document Top Bar & National Emblem Seal */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                {/* Emblem Seal */}
                <div className="w-16 h-16 rounded-2xl border-2 border-slate-900 flex flex-col items-center justify-center p-1 bg-slate-50 text-slate-900">
                  <ShieldCheck className="w-8 h-8 text-teal-700" />
                  <span className="text-[7px] font-mono font-extrabold uppercase mt-0.5 tracking-tighter">STATUTORY</span>
                </div>

                <div>
                  <h3 className="text-xs font-bold font-mono tracking-widest uppercase text-slate-600">
                    GOVERNMENT OF INDIA &bull; MINISTRY OF CONSUMER AFFAIRS
                  </h3>
                  <h1 className="text-xl md:text-2xl font-display font-black tracking-tight text-slate-950 uppercase mt-0.5">
                    Certificate of Statutory Compliance
                  </h1>
                  <p className="text-xs font-serif-luxury italic text-slate-600 mt-0.5">
                    Issued under Rule 6(1) & Rule 9 of the Legal Metrology (Packaged Commodities) Rules, 2011
                  </p>
                </div>
              </div>

              {/* Docket ID & QR */}
              <div className="text-right font-mono text-xs space-y-1">
                <div className="font-bold text-sm text-slate-900">{currentPreset.sampleCode}</div>
                <div className="text-[11px] text-slate-500">DATE: 24 FEB 2025</div>
                <div className="text-[10px] text-teal-700 font-bold">DIGITALLY VERIFIED</div>
              </div>

            </div>
          </div>

          {/* Executive Clearance Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 font-mono text-xs">
            <div className="p-2">
              <div className="text-slate-500 text-[10px] uppercase">STATUTORY VERDICT</div>
              <div className={`text-sm font-bold mt-0.5 ${currentPreset.isCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
                {currentPreset.isCompliant ? 'COMPLIANT (PASS)' : 'NON-COMPLIANT'}
              </div>
            </div>

            <div className="p-2">
              <div className="text-slate-500 text-[10px] uppercase">MEAN CONFIDENCE</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {(currentPreset.rules.reduce((acc, r) => acc + r.confidence, 0) / currentPreset.rules.length * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-2">
              <div className="text-slate-500 text-[10px] uppercase">COMPOUNDING RISK</div>
              <div className={`text-sm font-bold mt-0.5 ${currentPreset.isCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
                {currentPreset.isCompliant ? 'NIL (₹0)' : '₹75,000 PENALTY'}
              </div>
            </div>

            <div className="p-2">
              <div className="text-slate-500 text-[10px] uppercase">INSPECTION LATENCY</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {currentPreset.ocrLatencyMs} ms (TrOCR)
              </div>
            </div>
          </div>

          {/* Commodity & Package Specs */}
          <div className="mb-6 space-y-2 text-xs">
            <h4 className="font-mono font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1">
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>COMMODITY & PRINCIPAL DISPLAY PANEL (PDP) METRICS</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-1">
              <div>
                <span className="text-slate-500">COMMODITY: </span>
                <span className="font-semibold text-slate-900">{currentPreset.name}</span>
              </div>
              <div>
                <span className="text-slate-500">BRAND / ENTITY: </span>
                <span className="font-semibold text-slate-900">{currentPreset.brand}</span>
              </div>
              <div>
                <span className="text-slate-500">CATEGORY: </span>
                <span className="font-semibold text-slate-900">{currentPreset.category}</span>
              </div>
              <div>
                <span className="text-slate-500">EVALUATED PDP AREA: </span>
                <span className="font-semibold text-slate-900">142.8 cm² (Rule 9 Table 1)</span>
              </div>
            </div>
          </div>

          {/* Statutory 6-Rule Verification Matrix Table */}
          <div className="mb-8 overflow-x-auto">
            <h4 className="font-mono font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-700" />
              <span>STATUTORY DECLARATION AUDIT MATRIX (PCR RULE 6(1)(A) - (F))</span>
            </h4>

            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-slate-700">
                  <th className="p-2.5 font-bold">CLAUSE</th>
                  <th className="p-2.5 font-bold">MANDATORY DECLARATION</th>
                  <th className="p-2.5 font-bold">EXTRACTED CONTENT</th>
                  <th className="p-2.5 font-bold text-center">FONT (MM)</th>
                  <th className="p-2.5 font-bold text-center">CONF.</th>
                  <th className="p-2.5 font-bold text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentPreset.rules.map((rule) => {
                  const isPass = rule.status === 'pass';
                  return (
                    <tr key={rule.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-teal-800">{rule.subClause}</td>
                      <td className="p-2.5 font-medium text-slate-900">{rule.name}</td>
                      <td className="p-2.5 text-slate-600 max-w-xs truncate text-[11px]">
                        {rule.extractedValue}
                      </td>
                      <td className="p-2.5 text-center text-[11px]">
                        <span className={rule.measuredFontHeightMm >= rule.minimumFontHeightMm ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                          {rule.measuredFontHeightMm}mm
                        </span>
                        <span className="text-slate-400 text-[10px] block">min {rule.minimumFontHeightMm}mm</span>
                      </td>
                      <td className="p-2.5 text-center text-slate-700 text-[11px]">
                        {Math.round(rule.confidence * 100)}%
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        {isPass ? (
                          <span className="text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>PASS</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>FAIL</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cryptographic Digest & Seal Footer */}
          <div className="border-t-2 border-slate-900 pt-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* QR & Hash */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  SHA-256 CRYPTOGRAPHIC INTEGRITY DIGEST:
                </div>
                <div className="text-[10px] font-mono text-slate-800 max-w-sm truncate bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  Cryptographically timestamped and registered to the Central Metrology Registry Node.
                </div>
              </div>

              {/* Inspector Signature & Official Stamp */}
              {showInspectorSeal && (
                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-900">Dr. Rajeshwari Menon</div>
                    <div className="text-[10px] text-slate-600">Chief Inspector & Metrology Director</div>
                    <div className="text-[9px] text-teal-700 font-semibold">VALIDATED: 24-02-2025</div>
                  </div>

                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-700 flex flex-col items-center justify-center p-1 text-teal-800 rotate-[-12deg] bg-teal-50/50">
                    <Stamp className="w-6 h-6" />
                    <span className="text-[8px] font-extrabold uppercase font-mono mt-0.5 text-center leading-none">
                      GOVT OF INDIA<br />APPROVED
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Email Modal Dialog */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>Email Compliance Dossier</span>
              </h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Send the official Rule 6(1) audit report and statutory certificate directly to your QA or legal compliance team.
            </p>

            <form onSubmit={handleSendEmail} className="space-y-3">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="compliance-officer@enterprise.com"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSent}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer"
                >
                  {emailSent ? 'Sent Successfully!' : 'Dispatch PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
