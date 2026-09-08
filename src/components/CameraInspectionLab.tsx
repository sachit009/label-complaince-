import React, { useState, useRef, useEffect } from 'react';
import { AuditPreset, CameraSettings } from '../types';
import { 
  Camera, 
  Zap, 
  Scan, 
  Maximize2, 
  Sliders, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Sparkles,
  Aperture,
  Crosshair,
  Sun,
  Grid,
  Download,
  Image as ImageIcon
} from 'lucide-react';

interface CameraInspectionLabProps {
  currentPreset: AuditPreset;
  isDarkMode: boolean;
}

export const CameraInspectionLab: React.FC<CameraInspectionLabProps> = ({
  currentPreset,
  isDarkMode
}) => {
  const [settings, setSettings] = useState<CameraSettings>({
    evExposure: 0,
    magnification: 1.0,
    focusMode: 'AF-C',
    ledRing: 45,
    spectralCalibration: '5500K D65',
    complianceArchetype: 'Rigid Container / Box',
    showBoundingBoxes: true,
    showReticle: true
  });

  const [showGrid, setShowGrid] = useState(true);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [capturedSnapshots, setCapturedSnapshots] = useState<string[]>([
    currentPreset.imageUrl
  ]);
  const [activeSnapshot, setActiveSnapshot] = useState<string>(currentPreset.imageUrl);
  const [shutterMode, setShutterMode] = useState<'single' | 'continuous' | 'burst'>('single');

  // Trigger shutter snapshot
  const triggerShutter = () => {
    setIsShutterActive(true);
    setTimeout(() => {
      setIsShutterActive(false);
      // Add current to snapshots
      if (!capturedSnapshots.includes(currentPreset.imageUrl)) {
        setCapturedSnapshots([currentPreset.imageUrl, ...capturedSnapshots.slice(0, 3)]);
      }
    }, 200);
  };

  // Calculate filter brightness and contrast based on EV & spectral
  const filterStyle = {
    filter: `brightness(${1 + settings.evExposure * 0.2}) contrast(${1 + (settings.ledRing / 100) * 0.15}) ${
      settings.spectralCalibration === 'TUNGSTEN 3200K' 
        ? 'sepia(0.2)' 
        : settings.spectralCalibration === 'FL-4100K' 
          ? 'hue-rotate(15deg)' 
          : 'none'
    }`
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Aperture className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
              <span>Optical Inspection Lab</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                DSP v3.1
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Hardware-accelerated optical character recognition, Principal Display Panel area curvature unwarping, and font metrology.
            </p>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>NPU: 18ms / 60fps</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TrOCR-V3 READY</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Optical DSP Controls (3 cols on lg) */}
        <div className={`lg:col-span-3 p-4 rounded-2xl border space-y-5 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Optic Parameters</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">LIVE SYNC</span>
          </div>

          {/* Exposure EV */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">EXPOSURE (EV):</span>
              <span className="text-teal-300 font-bold">{settings.evExposure > 0 ? `+${settings.evExposure}` : settings.evExposure} EV</span>
            </div>
            <input 
              type="range" 
              min="-2" 
              max="2" 
              step="0.5"
              value={settings.evExposure} 
              onChange={(e) => setSettings({ ...settings, evExposure: parseFloat(e.target.value) })}
              className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-2.0</span>
              <span>0.0 (Auto)</span>
              <span>+2.0</span>
            </div>
          </div>

          {/* Optical Magnification */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">MAGNIFICATION:</span>
              <span className="text-teal-300 font-bold">{settings.magnification.toFixed(1)}x</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[1.0, 2.0, 4.0].map((mag) => (
                <button
                  key={mag}
                  onClick={() => setSettings({ ...settings, magnification: mag })}
                  className={`py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                    settings.magnification === mag
                      ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mag.toFixed(1)}x
                </button>
              ))}
            </div>
          </div>

          {/* Focus Engine Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 block">FOCUS ENGINE:</label>
            <div className="space-y-1">
              {(['AF-C', 'MACRO-OCR', 'MANUAL'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSettings({ ...settings, focusMode: mode })}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono text-left flex items-center justify-between transition-all cursor-pointer border ${
                    settings.focusMode === mode
                      ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{mode === 'AF-C' ? 'Auto Continuous (AF-C)' : mode === 'MACRO-OCR' ? 'Macro OCR Lock' : 'Manual Pinpoint'}</span>
                  {settings.focusMode === mode && <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>}
                </button>
              ))}
            </div>
          </div>

          {/* LED Ring Illuminator */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">LED RING ILLUMINATOR:</span>
              <span className="text-amber-300 font-bold">{settings.ledRing}%</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 45, 100].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSettings({ ...settings, ledRing: lvl as any })}
                  className={`py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                    settings.ledRing === lvl
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl === 0 ? 'OFF' : `${lvl}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Spectral Calibration */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 block">SPECTRAL CALIBRATION:</label>
            <select
              value={settings.spectralCalibration}
              onChange={(e) => setSettings({ ...settings, spectralCalibration: e.target.value as any })}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="5500K D65">5500K D65 (Standard Daylight)</option>
              <option value="FL-4100K">FL-4100K (Cool White Fluorescent)</option>
              <option value="TUNGSTEN 3200K">TUNGSTEN 3200K (Warm Incandescent)</option>
            </select>
          </div>

          {/* Compliance Archetype */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 block">LABEL ARCHETYPE:</label>
            <select
              value={settings.complianceArchetype}
              onChange={(e) => setSettings({ ...settings, complianceArchetype: e.target.value as any })}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="Rigid Container / Box">Rigid Container / Box</option>
              <option value="Cylindrical Bottle / Can">Cylindrical Bottle / Can (Curve DSP)</option>
              <option value="Blister Pack">Blister Pack (Rule 26 Exemption)</option>
              <option value="Flexible Pouch / Sachet">Flexible Pouch / Sachet</option>
            </select>
          </div>

        </div>

        {/* Center Column: High Precision Viewfinder (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            
            {/* Viewfinder Status Bar */}
            <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-rose-400 font-bold">REC [LIVE DSP]</span>
                <span className="text-slate-500">|</span>
                <span className="text-teal-300">{settings.complianceArchetype}</span>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded transition-all cursor-pointer ${showGrid ? 'bg-teal-500/30 text-teal-300' : 'text-slate-500'}`}
                  title="Toggle Alignment Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSettings({ ...settings, showBoundingBoxes: !settings.showBoundingBoxes })}
                  className={`p-1.5 rounded transition-all cursor-pointer ${settings.showBoundingBoxes ? 'bg-teal-500/30 text-teal-300' : 'text-slate-500'}`}
                  title="Toggle Bounding Boxes"
                >
                  <Scan className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viewfinder Canvas Stage */}
            <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
              
              {/* Shutter flash animation */}
              {isShutterActive && (
                <div className="absolute inset-0 bg-white z-50 animate-fade-out pointer-events-none" />
              )}

              {/* Grid lines overlay */}
              {showGrid && (
                <div className="absolute inset-0 z-10 pointer-events-none grid grid-cols-3 grid-rows-3 border border-teal-500/10 divide-x divide-y divide-teal-500/15" />
              )}

              {/* Parallax Crosshair & Reticle */}
              {settings.showReticle && (
                <div className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center">
                  <div className="relative w-36 h-36 border border-teal-400/40 rounded-full flex items-center justify-center">
                    <div className="w-1 h-3 bg-teal-400/80 absolute -top-1.5"></div>
                    <div className="w-1 h-3 bg-teal-400/80 absolute -bottom-1.5"></div>
                    <div className="h-1 w-3 bg-teal-400/80 absolute -left-1.5"></div>
                    <div className="h-1 w-3 bg-teal-400/80 absolute -right-1.5"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  </div>
                </div>
              )}

              {/* High precision corner brackets */}
              <div className="absolute inset-6 pointer-events-none z-15">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-400"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal-400"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-400"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-400"></div>
              </div>

              {/* The Image under inspection with active magnification & exposure filters */}
              <div 
                className="w-full h-full transition-transform duration-300"
                style={{
                  transform: `scale(${settings.magnification})`,
                  ...filterStyle
                }}
              >
                <img
                  src={activeSnapshot}
                  alt="Packaging Inspection"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Dynamic Bounding Boxes */}
              {settings.showBoundingBoxes && (
                <div 
                  className="absolute inset-0 z-20 pointer-events-none transition-transform duration-300"
                  style={{ transform: `scale(${settings.magnification})` }}
                >
                  {currentPreset.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`absolute border rounded-xs ${
                        rule.status === 'pass'
                          ? 'border-emerald-400 bg-emerald-500/15'
                          : 'border-rose-400 bg-rose-500/20 animate-pulse'
                      }`}
                      style={{
                        top: `${rule.bbox.top}%`,
                        left: `${rule.bbox.left}%`,
                        width: `${rule.bbox.width}%`,
                        height: `${rule.bbox.height}%`
                      }}
                    >
                      <span className="absolute -top-3.5 left-0 px-1 rounded text-[8px] font-mono font-bold bg-slate-900/90 text-teal-300 border border-slate-700">
                        {rule.subClause}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Viewfinder Bottom Shutter & Controls HUD */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              
              {/* Capture Mode Tabs & Shutter Trigger */}
              <div className="flex items-center justify-between">
                
                {/* Mode tabs */}
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                  {(['single', 'continuous', 'burst'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setShutterMode(m)}
                      className={`px-3 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                        shutterMode === m 
                          ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Shutter Button */}
                <div className="flex items-center gap-3">
                  <button
                    id="btn-master-shutter"
                    onClick={triggerShutter}
                    className="relative group w-14 h-14 rounded-full border-2 border-teal-400 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] cursor-pointer"
                    title="Capture Frame for Metrology OCR"
                  >
                    <div className="w-full h-full rounded-full bg-teal-500 group-hover:bg-teal-400 flex items-center justify-center text-slate-950 font-bold">
                      <Camera className="w-6 h-6 text-slate-950" />
                    </div>
                  </button>
                </div>

                {/* Snapshot Thumbnail Tray */}
                <div className="flex items-center gap-1.5">
                  {capturedSnapshots.map((snap, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSnapshot(snap)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        activeSnapshot === snap ? 'border-teal-400 ring-1 ring-teal-400' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={snap} alt={`Snapshot ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Rule 6(1) Real-Time Audit HUD (3 cols on lg) */}
        <div className={`lg:col-span-3 p-4 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5" />
              <span>Real-Time Audit HUD</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              6/6 ARMED
            </span>
          </div>

          {/* Quick Checklist */}
          <div className="space-y-2">
            {currentPreset.rules.map((rule) => {
              const isPass = rule.status === 'pass';
              return (
                <div
                  key={rule.id}
                  className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                    isPass 
                      ? 'bg-slate-950/60 border-slate-800/80' 
                      : 'bg-rose-950/30 border-rose-900/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-teal-300 font-bold">Rule {rule.subClause}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isPass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isPass ? 'VERIFIED' : 'DEFECT'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-1">
                    {rule.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>H: {rule.measuredFontHeightMm}mm</span>
                    <span>Conf: {Math.round(rule.confidence * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lab Notes Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1.5">
            <div className="text-teal-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OPTICAL CALIBRATION</span>
            </div>
            <p>
              Under Rule 9(1) of PCR 2011, area evaluation requires precision unwarping. The current lens model applies cylindrical planar projection.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
