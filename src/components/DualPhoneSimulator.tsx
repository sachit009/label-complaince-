import React, { useState } from 'react';
import { 
  Smartphone, 
  Zap, 
  Camera, 
  CheckCircle2, 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Minus,
  RotateCcw,
  Sliders
} from 'lucide-react';

interface DualPhoneSimulatorProps {
  isDarkMode: boolean;
  onNavigateToConsole: () => void;
}

export const DualPhoneSimulator: React.FC<DualPhoneSimulatorProps> = ({
  isDarkMode,
  onNavigateToConsole
}) => {
  const [isTorchActive, setIsTorchActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addedToCartToast, setAddedToCartToast] = useState(false);
  const [selectedProductTab, setSelectedProductTab] = useState<'audit' | 'nutrition' | 'pdp'>('audit');

  const handleAddToCart = () => {
    setCartCount(prev => prev + quantity);
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Smartphone className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-slate-100 flex items-center gap-2">
              <span>Dual Smartphone Inspection & DTC Simulator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                LabelGuard 4K
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive consumer on-device scanner (left) and authenticated DTC statutory storefront evaluation (right).
            </p>
          </div>
        </div>

        {/* Quick action to console */}
        <button
          onClick={onNavigateToConsole}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer shrink-0"
        >
          <span>Open in Enterprise Console</span>
          <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
        </button>
      </div>

      {/* Dual Phone Frames Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">

        {/* Left Smartphone: Consumer Camera Viewfinder */}
        <div className="relative w-[340px] h-[680px] bg-slate-950 rounded-[44px] border-[10px] border-slate-850 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between select-none">
          
          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 inset-x-0 z-30 flex justify-center">
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2">
              <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              <div className="w-2 h-2 rounded-full bg-teal-500/80 animate-pulse"></div>
            </div>
          </div>

          {/* Camera Stage with Hand Holding Gummy Vitamin */}
          <div className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center">
            
            {/* Packaging photo */}
            <img 
              src="https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&auto=format&fit=crop&q=80" 
              alt="Hand holding gummy vitamins" 
              className="w-full h-full object-cover filter contrast-105"
            />

            {/* Torch Light Simulation */}
            {isTorchActive && (
              <div className="absolute inset-0 bg-radial from-amber-100/35 via-transparent to-transparent pointer-events-none" />
            )}

            {/* Viewfinder Reticle & Scanline */}
            <div className="absolute inset-x-8 inset-y-24 border-2 border-teal-400/80 rounded-2xl pointer-events-none">
              
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-300"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-300"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-300"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-300"></div>

              {/* Laser Sweep */}
              <div className="absolute inset-x-0 animate-scan-laser">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee]"></div>
              </div>

              {/* Status Pill */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/90 text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/40 tracking-wider">
                SCANNING . . .
              </div>
            </div>

            {/* Viewfinder Top Controls */}
            <div className="absolute top-12 inset-x-6 z-20 flex justify-between items-center text-white">
              <button 
                onClick={() => setIsTorchActive(!isTorchActive)}
                className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                  isTorchActive ? 'bg-amber-400 text-slate-950' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
                title="Toggle Torch"
              >
                <Zap className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md">
                PCR 2011 AI
              </span>
            </div>

            {/* Bottom Detected Card */}
            <div className="absolute bottom-6 inset-x-4 z-20 p-3.5 rounded-2xl bg-slate-950/90 border border-teal-500/50 backdrop-blur-md text-white space-y-1.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Gummy Vitamins 42s</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% COMPLIANT
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                All 6 statutory labels verified. Manufacturer: Heart Dietary Supplements Co.
              </p>
            </div>

          </div>

          {/* Phone Bottom Home Bar */}
          <div className="absolute bottom-1.5 inset-x-0 flex justify-center z-30">
            <div className="w-32 h-1 bg-slate-400/60 rounded-full"></div>
          </div>
        </div>

        {/* Right Smartphone: Authenticated DTC Product Storefront */}
        <div className="relative w-[340px] h-[680px] bg-slate-950 rounded-[44px] border-[10px] border-slate-850 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between select-none">
          
          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 inset-x-0 z-30 flex justify-center">
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2">
              <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              <div className="w-2 h-2 rounded-full bg-teal-500/80"></div>
            </div>
          </div>

          {/* Phone Screen Content Stage */}
          <div className="w-full h-full bg-white text-slate-900 overflow-y-auto pt-10 pb-16 px-4 space-y-3.5 no-scrollbar">
            
            {/* Top Bar inside phone */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                HEART DIETARY SUPPLEMENTS
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-slate-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-teal-600 text-[8px] text-white font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Image Stage */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&auto=format&fit=crop&q=80" 
                alt="Gummy Vitamins 42s" 
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>PCR 2011 VERIFIED</span>
              </span>
            </div>

            {/* Product Title & Price */}
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-bold font-display text-slate-950">Gummy Vitamins</h3>
                <span className="text-base font-mono font-bold text-teal-700">$19.00</span>
              </div>
              <p className="text-[11px] text-slate-500">42 Gummies &bull; 3-Week Daily Supply</p>
            </div>

            {/* Compliance Badge */}
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Statutory Audit Verdict: 100% PASS</span>
                </span>
                <span className="font-mono text-teal-700">LMC-2025</span>
              </div>
              <p className="text-[10px] text-teal-800 leading-snug">
                Verified: Plot 450 Wellness Blvd, Net Wt 126g, USP $0.45/Gummy, Mfg 01/2025.
              </p>
            </div>

            {/* Dietary Badges */}
            <div className="flex flex-wrap gap-1">
              {['CoQ10 100mg', 'Vitamin D3 25mcg', 'Non-GMO', 'Gelatin-Free'].map((badge, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] font-medium bg-slate-100 text-slate-700">
                  {badge}
                </span>
              ))}
            </div>

            {/* Quantity Stepper & Add to Cart */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded text-slate-600 hover:bg-slate-200"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold font-mono text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded text-slate-600 hover:bg-slate-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{addedToCartToast ? 'Added to Bag!' : `Add • $${(19 * quantity).toFixed(2)}`}</span>
              </button>
            </div>

          </div>

          {/* Phone Bottom Home Bar */}
          <div className="absolute bottom-1.5 inset-x-0 flex justify-center z-30">
            <div className="w-32 h-1 bg-slate-900/60 rounded-full"></div>
          </div>
        </div>

      </div>

    </div>
  );
};
