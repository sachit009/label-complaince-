import React, { useState, useRef, useEffect } from 'react';
import { 
  AuditPreset, 
  RuleAuditItem 
} from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Upload, 
  RefreshCw, 
  Zap, 
  Eye, 
  Copy, 
  Check, 
  FileCheck2, 
  Sparkles, 
  ScanLine, 
  Sliders, 
  ChevronRight, 
  Edit3, 
  Keyboard, 
  RotateCcw, 
  Layers,
  FileText,
  Plus,
  Minus
} from 'lucide-react';

interface DualAuditConsoleProps {
  presets: AuditPreset[];
  currentPreset: AuditPreset;
  setCurrentPreset: (preset: AuditPreset) => void;
  isDarkMode: boolean;
  onNavigateToCertificate: () => void;
  onOpenGeminiWithQuery: (query: string) => void;
}

export type AuditInputMode = 'camera_ocr' | 'manual_entry';

export const DualAuditConsole: React.FC<DualAuditConsoleProps> = ({
  presets,
  currentPreset,
  setCurrentPreset,
  isDarkMode,
  onNavigateToCertificate,
  onOpenGeminiWithQuery
}) => {
  const [activeTab, setActiveTab] = useState<'declarations' | 'json'>('declarations');
  const [inputMode, setInputMode] = useState<AuditInputMode>('camera_ocr');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(100);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [showLaserSweep, setShowLaserSweep] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showTokenOverlay, setShowTokenOverlay] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [showManualSuccessToast, setShowManualSuccessToast] = useState(false);

  // Editable rules state initialized from currentPreset
  const [editableRules, setEditableRules] = useState<RuleAuditItem[]>(currentPreset.rules);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync editable rules whenever preset changes
  useEffect(() => {
    setEditableRules(currentPreset.rules);
    setSelectedRuleId(null);
  }, [currentPreset]);

  // Stop camera when unmounting or switching to static
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle WebRTC camera toggle
  const toggleLiveCamera = async () => {
    if (isLiveCamera) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      setCameraStream(null);
      setIsLiveCamera(false);
      setCameraError(null);
    } else {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        setCameraStream(stream);
        setIsLiveCamera(true);
        setInputMode('camera_ocr'); // auto switch to camera mode
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError('Camera access unavailable or blocked in iframe. Using high-definition package simulation feed.');
        setIsLiveCamera(false);
      }
    }
  };

  useEffect(() => {
    if (isLiveCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isLiveCamera, cameraStream]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomImage(result);
        setIsLiveCamera(false);
        setInputMode('camera_ocr');
        runAuditSimulation();
      };
      reader.readAsDataURL(file);
    }
  };

  // Run audit simulation animation
  const runAuditSimulation = () => {
    setIsAuditing(true);
    setAuditProgress(10);
    const interval = setInterval(() => {
      setAuditProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  // Real-time validator for manual entries
  const handleRuleValueChange = (ruleId: string, newValue: string, newFontHeight?: number) => {
    setEditableRules(prevRules => {
      return prevRules.map(rule => {
        if (rule.id !== ruleId) return rule;

        const val = newValue;
        const fontH = newFontHeight !== undefined ? newFontHeight : rule.measuredFontHeightMm;
        const fontPass = fontH >= rule.minimumFontHeightMm;

        let contentPass = false;
        const lower = val.toLowerCase();

        switch (rule.subClause) {
          case '6(1)(a)':
            // Manufacturer/packer must have reasonable length and entity keyword
            contentPass = val.trim().length >= 12 && (lower.includes('mfd') || lower.includes('mfg') || lower.includes('manufactured') || lower.includes('plot') || lower.includes('ltd') || lower.includes('pvt') || lower.includes('imported'));
            break;
          case '6(1)(b)':
            // Generic product name
            contentPass = val.trim().length >= 4;
            break;
          case '6(1)(c)':
            // Net quantity with standard SI unit (g, kg, ml, l, N)
            contentPass = /\b(\d+(\.\d+)?)\s*(g|kg|ml|l|n|gm|gms|count|gummies|pieces|m|cm)\b/i.test(val);
            break;
          case '6(1)(d)':
            // Month & Year of Mfg/Import
            contentPass = /\b(\d{1,2}[\/-]\d{2,4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{2,4})\b/i.test(val);
            break;
          case '6(1)(e)':
            // MRP & Unit Sale Price
            contentPass = (lower.includes('mrp') || lower.includes('rs') || lower.includes('₹')) && (lower.includes('tax') || lower.includes('incl') || lower.includes('usp') || lower.includes('unit'));
            break;
          case '6(1)(f)':
            // Customer Care (email or phone)
            contentPass = val.includes('@') || /\b\d{4,}\b/.test(val) || lower.includes('care') || lower.includes('support') || lower.includes('toll');
            break;
          default:
            contentPass = val.trim().length > 3;
        }

        const isPass = contentPass && fontPass;

        return {
          ...rule,
          extractedValue: val,
          measuredFontHeightMm: fontH,
          status: isPass ? 'pass' : 'fail',
          confidence: isPass ? 0.99 : 0.65
        };
      });
    });
  };

  // Reset editable rules back to initial detected OCR preset
  const handleResetToOcr = () => {
    setEditableRules(currentPreset.rules);
    setShowManualSuccessToast(true);
    setTimeout(() => setShowManualSuccessToast(false), 2000);
  };

  // Calculate live dynamic compliance metrics based on editableRules
  const passedCount = editableRules.filter(r => r.status === 'pass').length;
  const totalCount = editableRules.length;
  const liveScore = Math.round((passedCount / totalCount) * 100);
  const isLiveCompliant = liveScore === 100;

  const handleCopyJson = () => {
    const payload = JSON.stringify({
      statute: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      version: 'PCR-2011/Rev-2022',
      input_mode: inputMode,
      sample_id: currentPreset.sampleCode,
      product: currentPreset.name,
      overall_verdict: isLiveCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
      compliance_score_pct: liveScore,
      ocr_latency_ms: currentPreset.ocrLatencyMs,
      rule_declarations: editableRules.map(r => ({
        sub_clause: r.subClause,
        rule_name: r.name,
        extracted_text: r.extractedValue,
        status: r.status,
        confidence: r.confidence,
        measured_font_height_mm: r.measuredFontHeightMm,
        minimum_font_height_mm: r.minimumFontHeightMm,
        statutory_penalty: r.statutoryPenalty
      }))
    }, null, 2);

    navigator.clipboard.writeText(payload);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const currentDisplayImage = customImage || currentPreset.imageUrl;

  return (
    <div className="space-y-6">

      {/* Preset Selector & Controls Bar */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-slate-850/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <span className="text-xs font-mono text-slate-400 font-medium shrink-0 flex items-center gap-1.5 mr-1">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>TEST PRESETS:</span>
            </span>

            {presets.map((preset) => {
              const isSelected = currentPreset.id === preset.id && !customImage;
              return (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => {
                    setCustomImage(null);
                    setCurrentPreset(preset);
                    setSelectedRuleId(null);
                    runAuditSimulation();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-teal-500/15 border-teal-500/60 text-teal-300 shadow-xs'
                        : 'bg-teal-50 border-teal-500 text-teal-900 shadow-2xs font-bold'
                      : isDarkMode
                        ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${preset.isCompliant ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="truncate max-w-[160px]">{preset.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    preset.isCompliant 
                      ? isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800' 
                      : isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {preset.isCompliant ? 'PASS' : 'FAIL'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick-Scan Mode Switcher & Source Controls */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            
            {/* Quick-Scan Mode Toggle Pill */}
            <div className={`p-1 rounded-xl border flex items-center text-xs font-mono ${
              isDarkMode ? 'bg-slate-900 border-slate-700/80' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                id="btn-mode-camera-ocr"
                onClick={() => setInputMode('camera_ocr')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                  inputMode === 'camera_ocr'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to live optical camera OCR scanning"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera OCR</span>
              </button>
              <button
                id="btn-mode-manual-entry"
                onClick={() => setInputMode('manual_entry')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                  inputMode === 'manual_entry'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to manual data entry & statutory calibration"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Manual Entry</span>
              </button>
            </div>

            {/* Upload Label */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
              id="package-file-input"
            />
            <button
              id="btn-upload-label"
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white' 
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>Upload</span>
            </button>

            {/* Live WebRTC Camera Toggle */}
            <button
              id="btn-toggle-webrtc"
              onClick={toggleLiveCamera}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isLiveCamera 
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-500' 
                  : isDarkMode
                    ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 hover:bg-teal-500/25'
                    : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100/80 shadow-2xs'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isLiveCamera ? 'Stop WebRTC' : 'Live Cam'}</span>
            </button>
          </div>

        </div>

        {cameraError && (
          <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* Main Dual Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Viewport / Manual Entry Stage (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`relative rounded-2xl overflow-hidden border transition-all ${
            isDarkMode ? 'bg-slate-950 border-slate-800 shadow-xl' : 'bg-slate-900 border-slate-300 shadow-md'
          }`}>

            {/* Viewport Top HUD Overlay */}
            <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent flex items-center justify-between text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] ${
                  inputMode === 'camera_ocr'
                    ? 'bg-slate-800/80 border-slate-700 text-teal-300'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${inputMode === 'camera_ocr' ? 'bg-teal-400 animate-ping' : 'bg-amber-400'}`}></span>
                  <span>{inputMode === 'camera_ocr' ? (isLiveCamera ? 'WEBRTC 1080P' : 'OPTICAL FEED') : 'MANUAL ENTRY'}</span>
                </span>
                <span className="text-[11px] text-slate-400">{currentPreset.sampleCode}</span>
              </div>

              {/* Viewport Toggles (Active in Camera OCR Mode) */}
              {inputMode === 'camera_ocr' && (
                <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700/60">
                  <button
                    id="btn-toggle-laser"
                    onClick={() => setShowLaserSweep(!showLaserSweep)}
                    className={`p-1.5 rounded transition-all cursor-pointer ${showLaserSweep ? 'bg-teal-500/30 text-teal-300' : 'text-slate-500'}`}
                    title="Toggle Laser Scanline"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-toggle-bboxes"
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className={`p-1.5 rounded transition-all cursor-pointer ${showBoundingBoxes ? 'bg-teal-500/30 text-teal-300' : 'text-slate-500'}`}
                    title="Toggle Bounding Boxes"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-toggle-torch"
                    onClick={() => setIsTorchOn(!isTorchOn)}
                    className={`p-1.5 rounded transition-all cursor-pointer ${isTorchOn ? 'bg-amber-500/30 text-amber-300' : 'text-slate-500'}`}
                    title="Toggle Torch LED Simulation"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Reset to Detected in Manual Entry Mode */}
              {inputMode === 'manual_entry' && (
                <button
                  onClick={handleResetToOcr}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  title="Reset fields to OCR detected values"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Reset OCR</span>
                </button>
              )}
            </div>

            {/* QUICK-SCAN OVERLAY BUTTON: Prominent floating interactive toggle button */}
            <div className="absolute top-12 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
              <button
                id="btn-quick-scan-overlay"
                onClick={() => setInputMode(inputMode === 'camera_ocr' ? 'manual_entry' : 'camera_ocr')}
                className={`pointer-events-auto group px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all shadow-xl backdrop-blur-md flex items-center gap-2 border cursor-pointer hover:scale-105 active:scale-95 ${
                  inputMode === 'camera_ocr'
                    ? 'border-teal-400/50 bg-slate-950/85 hover:bg-slate-900 text-teal-300 hover:text-teal-200'
                    : 'border-amber-400/60 bg-slate-950/90 hover:bg-slate-900 text-amber-300 hover:text-amber-200'
                }`}
                title="Click to instantly toggle between manual data entry and camera OCR scanning"
              >
                {inputMode === 'camera_ocr' ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
                    <span>QUICK-SCAN: CAMERA OCR ACTIVE</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-amber-300 border-l border-slate-700 pl-2 flex items-center gap-1 font-sans font-medium">
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Switch to Manual</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>MANUAL DATA ENTRY ACTIVE</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 border-l border-slate-700 pl-2 flex items-center gap-1 font-sans font-medium">
                      <Camera className="w-3 h-3 text-cyan-400" />
                      <span>⚡ Switch to Camera OCR</span>
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* STAGE CONTAINER: Either Camera OCR Viewfinder OR Manual Data Entry Console */}
            {inputMode === 'camera_ocr' ? (
              /* Camera OCR Viewfinder Canvas */
              <div className="relative aspect-4/5 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                
                {/* Torch LED Highlight layer */}
                {isTorchOn && (
                  <div className="absolute inset-0 pointer-events-none z-10 bg-radial from-amber-100/25 via-transparent to-transparent opacity-80" />
                )}

                {/* Laser Scanning Line */}
                {showLaserSweep && (
                  <div className="absolute inset-x-0 z-20 pointer-events-none animate-scan-laser">
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]" />
                    <div className="h-10 w-full bg-gradient-to-b from-cyan-500/15 to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Live WebRTC video feed or Photo */}
                {isLiveCamera ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={currentDisplayImage}
                      alt={currentPreset.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isAuditing ? 'scale-[1.02] filter contrast-110' : ''
                      }`}
                    />
                    {/* Subtle dark vignette overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
                  </div>
                )}

                {/* Bounding Boxes Overlay */}
                {showBoundingBoxes && (
                  <div className="absolute inset-0 z-15 pointer-events-none">
                    {editableRules.map((rule) => {
                      const isSelected = selectedRuleId === rule.id;
                      const isPassed = rule.status === 'pass';

                      return (
                        <div
                          key={rule.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRuleId(rule.id);
                          }}
                          className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 border rounded-xs ${
                            isSelected
                              ? 'ring-2 ring-cyan-400 bg-cyan-400/20 z-30'
                              : isPassed
                                ? 'border-emerald-400/80 bg-emerald-500/10 hover:bg-emerald-500/25 z-10'
                                : 'border-rose-400/90 bg-rose-500/15 hover:bg-rose-500/30 z-20 animate-pulse'
                          }`}
                          style={{
                            top: `${rule.bbox.top}%`,
                            left: `${rule.bbox.left}%`,
                            width: `${rule.bbox.width}%`,
                            height: `${rule.bbox.height}%`
                          }}
                          title={`Rule ${rule.subClause}: ${rule.name}`}
                        >
                          {/* Tag Pill */}
                          <div className={`absolute -top-4 left-0 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs whitespace-nowrap ${
                            isPassed 
                              ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/40' 
                              : 'bg-rose-900/90 text-rose-200 border border-rose-500/40'
                          }`}>
                            <span>{rule.subClause}</span>
                            <span className="opacity-75">{Math.round(rule.confidence * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Raw OCR Word Token Mesh (if toggled) */}
                {showTokenOverlay && (
                  <div className="absolute inset-0 z-16 pointer-events-none">
                    {currentPreset.rawOcrTokens.map((token, idx) => (
                      <div
                        key={idx}
                        className="absolute border border-dashed border-teal-300/60 bg-teal-400/10 text-[8px] font-mono text-teal-200 px-0.5 truncate"
                        style={{
                          top: `${token.bbox.top}%`,
                          left: `${token.bbox.left}%`,
                          width: `${token.bbox.width}%`,
                          height: `${token.bbox.height}%`
                        }}
                      >
                        {token.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reticle Corner Marks */}
                <div className="absolute inset-4 pointer-events-none border border-slate-700/40 rounded-xl">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-teal-400"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-teal-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-teal-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-teal-400"></div>
                </div>

                {/* Center Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="w-12 h-12 border border-slate-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  </div>
                </div>

              </div>
            ) : (
              /* Manual Data Entry & Statutory Calibration Stage */
              <div className={`relative aspect-4/5 w-full overflow-y-auto p-4 pt-20 space-y-3 font-sans no-scrollbar ${
                isDarkMode ? 'bg-slate-950' : 'bg-slate-100/70'
              }`}>
                
                <div className={`flex items-center justify-between pb-2 border-b ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-amber-500" />
                    <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      Manual Declarations Editor
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    REAL-TIME VALIDATION
                  </span>
                </div>

                <p className={`text-[11px] leading-snug ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Edit or override statutory values manually to test compliance, measure custom font heights, or audit unreadable labels.
                </p>

                {/* Editable List of 6 Rules */}
                <div className="space-y-3 pt-1">
                  {editableRules.map((rule) => {
                    const isPass = rule.status === 'pass';
                    return (
                      <div 
                        key={rule.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isPass 
                            ? isDarkMode
                              ? 'bg-slate-900/80 border-slate-800 focus-within:border-teal-500/60'
                              : 'bg-white border-slate-200 focus-within:border-teal-600 shadow-2xs' 
                            : isDarkMode
                              ? 'bg-rose-950/20 border-rose-900/50 focus-within:border-rose-500'
                              : 'bg-rose-50/70 border-rose-200 focus-within:border-rose-400 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`font-mono text-[11px] font-bold ${
                            isDarkMode ? 'text-teal-300' : 'text-teal-800'
                          }`}>
                            Rule {rule.subClause}: {rule.name}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isPass 
                              ? isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800' 
                              : isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPass ? 'PASS' : 'FAIL'}
                          </span>
                        </div>

                        {/* Text Value Input */}
                        <textarea
                          rows={2}
                          value={rule.extractedValue}
                          onChange={(e) => handleRuleValueChange(rule.id, e.target.value)}
                          className={`w-full p-2 rounded-lg text-xs font-mono border resize-none leading-relaxed focus:outline-none ${
                            isDarkMode 
                              ? 'bg-slate-950 border-slate-700/80 text-slate-200 focus:border-teal-500' 
                              : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-600'
                          }`}
                          placeholder={`Enter declaration text for Rule ${rule.subClause}...`}
                        />

                        {/* Font Height Stepper & Min Threshold */}
                        <div className={`mt-2 flex items-center justify-between text-[11px] font-mono ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          <span>Req Min: ≥{rule.minimumFontHeightMm}mm</span>
                          
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>FONT:</span>
                            <button
                              type="button"
                              onClick={() => handleRuleValueChange(rule.id, rule.extractedValue, Math.max(0.5, +(rule.measuredFontHeightMm - 0.2).toFixed(1)))}
                              className={`p-0.5 rounded cursor-pointer ${
                                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`font-bold ${
                              rule.measuredFontHeightMm >= rule.minimumFontHeightMm 
                                ? isDarkMode ? 'text-teal-300' : 'text-teal-800' 
                                : 'text-rose-600'
                            }`}>
                              {rule.measuredFontHeightMm.toFixed(1)} mm
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRuleValueChange(rule.id, rule.extractedValue, +(rule.measuredFontHeightMm + 0.2).toFixed(1))}
                              className={`p-0.5 rounded cursor-pointer ${
                                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Return to Camera Quick Scan button */}
                <div className="pt-2">
                  <button
                    onClick={() => setInputMode('camera_ocr')}
                    className="w-full py-2 px-3 rounded-xl font-sans text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Return to Camera OCR Viewport</span>
                  </button>
                </div>

              </div>
            )}

            {/* Viewport Bottom Diagnostics Panel */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-500">MODE</div>
                  <div className="text-teal-300 font-bold truncate">
                    {inputMode === 'camera_ocr' ? 'CAMERA OCR' : 'MANUAL ENTRY'}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-500">RES / DPI</div>
                  <div className="text-teal-300 font-bold">300 DPI</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-500">CONTRAST</div>
                  <div className="text-emerald-400 font-bold">14.8 : 1</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-500">LATENCY</div>
                  <div className="text-teal-300 font-bold">{currentPreset.ocrLatencyMs}ms</div>
                </div>
              </div>

              {/* Audit Trigger Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  id="btn-run-audit"
                  onClick={runAuditSimulation}
                  disabled={isAuditing}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-sans text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>{isAuditing ? `Auditing (${auditProgress}%)` : 'Re-Run Rule 6(1) Audit'}</span>
                </button>

                <button
                  id="btn-toggle-tokens"
                  onClick={() => setShowTokenOverlay(!showTokenOverlay)}
                  className={`px-3 py-2 rounded-xl text-xs font-sans font-medium border transition-all cursor-pointer ${
                    showTokenOverlay 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Inspect raw OCR extracted tokens"
                >
                  Tokens
                </button>
              </div>

            </div>

          </div>

          {/* Quick Legal Tip Card */}
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
          }`}>
            <span className={`font-semibold font-mono ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>STATUTORY NOTE:</span> Section 36 of the Legal Metrology Act, 2009 penalizes non-declaration or deceptive packaging with fines up to ₹1,00,000 or imprisonment for second and subsequent offences.
          </div>

        </div>

        {/* Right Column: Statutory Declarations Table & JSON Desk (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Executive Compliance Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isLiveCompliant
              ? isDarkMode 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100' 
                : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : isDarkMode 
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-100' 
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isLiveCompliant 
                    ? 'bg-emerald-500/20 text-emerald-500' 
                    : 'bg-rose-500/20 text-rose-500'
                }`}>
                  {isLiveCompliant ? (
                    <ShieldCheck className="w-7 h-7" />
                  ) : (
                    <AlertTriangle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-editorial font-bold text-base tracking-tight">
                      {isLiveCompliant 
                        ? 'COMPLIANT — READY FOR RETAIL SALE' 
                        : 'NON-COMPLIANT — STATUTORY VIOLATION DETECTED'}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isLiveCompliant 
                      ? 'All 6 mandatory declarations under Rule 6(1) verified against PCR, 2011 standards.'
                      : 'Missing or defective declarations detected. Compounding risk under Rule 32 / Section 32.'}
                  </p>
                </div>
              </div>

              {/* Score & Certificate Action */}
              <div className="flex items-center gap-2 sm:self-center shrink-0">
                <div className="text-right pr-2">
                  <div className="text-[10px] font-mono opacity-70">AUDIT SCORE</div>
                  <div className={`font-mono text-lg font-extrabold ${
                    isLiveCompliant 
                      ? isDarkMode ? 'text-emerald-400' : 'text-emerald-700' 
                      : isDarkMode ? 'text-rose-400' : 'text-rose-700'
                  }`}>
                    {liveScore}%
                  </div>
                </div>

                <button
                  id="btn-view-certificate"
                  onClick={onNavigateToCertificate}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar inside Banner */}
            <div className="mt-3 pt-3 border-t border-current/15 grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <span className="opacity-70 text-[10px] block">VERIFICATION</span>
                <span className="font-semibold">
                  {passedCount} / {totalCount} Rules Passed
                </span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">COMPOUNDING RISK</span>
                <span className={`font-semibold ${
                  isLiveCompliant 
                    ? isDarkMode ? 'text-emerald-400' : 'text-emerald-700' 
                    : isDarkMode ? 'text-rose-400' : 'text-rose-700'
                }`}>
                  {isLiveCompliant ? 'NIL (₹0)' : '₹75,000 Est.'}
                </span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">INPUT SOURCE</span>
                <span className={`font-semibold uppercase ${
                  isDarkMode ? 'text-teal-300' : 'text-teal-800'
                }`}>
                  {inputMode === 'camera_ocr' ? 'OCR SCAN' : 'MANUAL ENTRY'}
                </span>
              </div>
            </div>

          </div>

          {/* Tab Navigation: Table vs JSON */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center p-1 rounded-xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                id="btn-tab-declarations"
                onClick={() => setActiveTab('declarations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'declarations'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mandatory Declarations Table (Rule 6(1))
              </button>
              <button
                id="btn-tab-json"
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FastAPI JSON Payload
              </button>
            </div>

            {activeTab === 'json' && (
              <button
                id="btn-copy-payload"
                onClick={handleCopyJson}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white' 
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {/* Declarations List View */}
          {activeTab === 'declarations' ? (
            <div className="space-y-3">
              {editableRules.map((rule) => {
                const isSelected = selectedRuleId === rule.id;
                const isPass = rule.status === 'pass';

                return (
                  <div
                    key={rule.id}
                    id={`rule-card-${rule.id.replace(/[()]/g, '')}`}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-slate-800/90 border-cyan-500/70 ring-1 ring-cyan-500/50 shadow-md'
                          : 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-500/40 shadow-xs'
                        : isDarkMode
                          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Header line of Rule */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          isPass 
                            ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : isDarkMode ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          Rule {rule.subClause}
                        </span>
                        <h4 className={`font-editorial font-bold text-sm ${
                          isDarkMode ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                          {rule.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Font size validation tag */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          rule.measuredFontHeightMm >= rule.minimumFontHeightMm
                            ? isDarkMode ? 'bg-slate-800 text-teal-300 border-slate-700' : 'bg-slate-100 text-teal-800 border-slate-200'
                            : 'bg-rose-900/40 text-rose-300 border-rose-700'
                        }`} title={`Measured: ${rule.measuredFontHeightMm}mm | Required: ≥${rule.minimumFontHeightMm}mm`}>
                          Font: {rule.measuredFontHeightMm}mm {rule.measuredFontHeightMm >= rule.minimumFontHeightMm ? '≥' : '<'} {rule.minimumFontHeightMm}mm
                        </span>

                        {isPass ? (
                          <span className={`flex items-center gap-1 text-xs font-semibold ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>PASS</span>
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 text-xs font-semibold ${
                            isDarkMode ? 'text-rose-400' : 'text-rose-700'
                          }`}>
                            <XCircle className="w-4 h-4" />
                            <span>FAIL</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Statutory Requirement Text */}
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {rule.statutoryRequirement}
                    </p>

                    {/* Extracted / Manually entered Value Box */}
                    <div className={`mt-2 p-2.5 rounded-lg font-mono text-xs border ${
                      isPass
                        ? isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                        : isDarkMode ? 'bg-rose-950/30 border-rose-900/50 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-0.5 text-slate-500">
                        <span>Current Value:</span>
                        <span className="text-[9px]">
                          {inputMode === 'manual_entry' ? 'Editable in Manual Entry' : 'OCR Detected'}
                        </span>
                      </div>
                      <div className="font-medium">{rule.extractedValue}</div>
                    </div>

                    {/* Footer with Penalty and Edit / Focus buttons */}
                    <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                      isDarkMode ? 'border-slate-800/60 text-slate-400' : 'border-slate-200 text-slate-600'
                    }`}>
                      <div className="truncate max-w-md">
                        <span className={`font-semibold ${
                          isDarkMode ? 'text-amber-400/90' : 'text-amber-800'
                        }`}>Liability: </span>
                        <span>{rule.statutoryPenalty}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {/* Quick toggle to manual edit for this rule */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInputMode('manual_entry');
                            setSelectedRuleId(rule.id);
                          }}
                          className={`font-semibold flex items-center gap-1 cursor-pointer ${
                            isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'
                          }`}
                          title="Edit this rule manually"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRuleId(rule.id);
                            if (inputMode !== 'camera_ocr') {
                              setInputMode('camera_ocr');
                            }
                          }}
                          className={`font-semibold flex items-center gap-1 cursor-pointer ${
                            isDarkMode ? 'text-teal-400 hover:text-teal-300' : 'text-teal-700 hover:text-teal-800'
                          }`}
                        >
                          <span>Focus</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* JSON View */
            <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[500px] ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-teal-300' : 'bg-slate-900 border-slate-800 text-teal-300'
            }`}>
              <pre>{JSON.stringify({
                status: 'success',
                engine: 'LegalMetrology.AI v2.4-fastapi',
                input_mode: inputMode,
                docket_id: currentPreset.sampleCode,
                commodity: currentPreset.name,
                overall_verdict: isLiveCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
                compliance_rate: `${liveScore}%`,
                latency_ms: currentPreset.ocrLatencyMs,
                declarations: editableRules.map(r => ({
                  rule: r.subClause,
                  name: r.name,
                  verdict: r.status.toUpperCase(),
                  confidence: r.confidence,
                  extracted_text: r.extractedValue,
                  font_validation: {
                    measured_mm: r.measuredFontHeightMm,
                    statutory_min_mm: r.minimumFontHeightMm,
                    compliant: r.measuredFontHeightMm >= r.minimumFontHeightMm
                  },
                  bbox_coordinates: r.bbox,
                  legal_liability: r.statutoryPenalty
                }))
              }, null, 2)}</pre>
            </div>
          )}

          {/* Ask Gemini Compliance Assistant Mini-Bar */}
          <div className={`p-3.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className={`text-xs font-bold ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>Ask Gemini AI Compliance Assistant</span>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                'Section 36 Compounding Fine for missing USP',
                'Rule 9 Font Height rules for Cylindrical Bottles',
                'Exemption threshold under Rule 26',
                'Imported Goods Country of Origin guidelines'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onOpenGeminiWithQuery(chip)}
                  className={`px-2 py-1 rounded-md text-[11px] transition-all border cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-teal-500/20 hover:text-teal-300 border-slate-700/60' 
                      : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800 border-slate-200 font-medium'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && queryInput.trim()) {
                    onOpenGeminiWithQuery(queryInput);
                    setQueryInput('');
                  }
                }}
                placeholder="Ask about Rule 6(1) clauses, court precedents, or packaging requirements..."
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-teal-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-600'
                }`}
              />
              <button
                onClick={() => {
                  if (queryInput.trim()) {
                    onOpenGeminiWithQuery(queryInput);
                    setQueryInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer shrink-0"
              >
                Analyze
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
