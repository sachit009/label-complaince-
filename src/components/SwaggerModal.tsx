import React, { useState } from 'react';
import { Code2, Copy, Check, Play, FileJson, Server, Terminal } from 'lucide-react';

interface SwaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const SwaggerModal: React.FC<SwaggerModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'verify' | 'rules' | 'pdf'>('verify');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  if (!isOpen) return null;

  const curlVerify = `curl -X 'POST' \\
  'https://api.legalmetrology.ai/v1/compliance/verify-label' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'image=@package_label.jpg;type=image/jpeg' \\
  -F 'archetype=rigid_carton' \\
  -F 'enforce_font_thresholds=true'`;

  const curlRules = `curl -X 'GET' \\
  'https://api.legalmetrology.ai/v1/rules/pcr-2011/declarations' \\
  -H 'accept: application/json'`;

  const handleCopyCurl = () => {
    const text = activeEndpoint === 'verify' ? curlVerify : curlRules;
    navigator.clipboard.writeText(text);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setResponseStatus(200);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-100 font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base">LegalMetrology.AI REST API</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300">
                  OpenAPI 3.0.3
                </span>
              </div>
              <p className="text-xs text-slate-400">FastAPI production schema & asynchronous microservice endpoints</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 no-scrollbar">
          
          {/* Endpoint Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => { setActiveEndpoint('verify'); setResponseStatus(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeEndpoint === 'verify' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">POST</span>
              <span>/v1/compliance/verify-label</span>
            </button>

            <button
              onClick={() => { setActiveEndpoint('rules'); setResponseStatus(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeEndpoint === 'rules' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">GET</span>
              <span>/v1/rules/pcr-2011/declarations</span>
            </button>
          </div>

          {/* Active Endpoint Spec */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase">cURL Request Spec:</span>
              <button
                onClick={handleCopyCurl}
                className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 cursor-pointer"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 overflow-x-auto">
              <pre>{activeEndpoint === 'verify' ? curlVerify : curlRules}</pre>
            </div>

            {/* Execute Test Button */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-4 py-2 rounded-xl text-xs font-sans font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Executing Ingestion...' : 'Try It Out (Execute)'}</span>
              </button>
            </div>

            {/* Simulated Live Response */}
            {responseStatus && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 uppercase font-bold">Response Code:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    200 OK (142ms)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto max-h-56">
                  <pre>{JSON.stringify({
                    status: "success",
                    timestamp: new Date().toISOString(),
                    statute: "PCR-2011/Rule-6(1)",
                    audit_verdict: "COMPLIANT",
                    score_percentage: 100,
                    rules_evaluated: 6,
                    rules_passed: 6,
                    compounding_risk_inr: 0,
                    pdp_analysis: {
                      measured_area_sqcm: 142.8,
                      aspect_ratio: "1.4:1",
                      minimum_font_requirement_mm: 2.0
                    }
                  }, null, 2)}</pre>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            Close Specs
          </button>
        </div>

      </div>
    </div>
  );
};
