import React from 'react';
import { 
  ShieldCheck, 
  Camera, 
  FileText, 
  Users, 
  Smartphone, 
  Code2, 
  Sun, 
  Moon, 
  Activity,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'audit-console' | 'camera-lab' | 'certificate' | 'community' | 'dual-phone';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  openSwagger: () => void;
  openGeminiModal: () => void;
  complianceScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  openSwagger,
  openGeminiModal,
  complianceScore
}) => {
  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md' 
        : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Statutory Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${
              isDarkMode 
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                : 'bg-teal-600/10 border-teal-600/20 text-teal-700'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-editorial font-bold text-lg tracking-tight ${
                  isDarkMode 
                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300' 
                    : 'text-teal-900'
                }`}>
                  LegalMetrology<span className={isDarkMode ? 'text-white' : 'text-teal-600'}>.AI</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  isDarkMode 
                    ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' 
                    : 'bg-teal-50 text-teal-700 border-teal-200'
                }`}>
                  PCR 2011
                </span>
              </div>
              <p className={`text-[11px] flex items-center gap-1.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium">Rule 6(1) Regulatory Inspection Console</span>
              </p>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-xl border ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/50' 
              : 'bg-slate-100/90 border-slate-200'
          }`}>
            <button
              id="tab-audit-console"
              onClick={() => setActiveTab('audit-console')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audit-console'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dual Audit Console</span>
            </button>

            <button
              id="tab-camera-lab"
              onClick={() => setActiveTab('camera-lab')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'camera-lab'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Inspection Lab</span>
              <span className={`px-1 rounded text-[9px] font-mono ${
                isDarkMode ? 'bg-teal-400/20 text-teal-300' : 'bg-teal-100 text-teal-800'
              }`}>DSP</span>
            </button>

            <button
              id="tab-certificate"
              onClick={() => setActiveTab('certificate')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'certificate'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Statutory Certificate</span>
            </button>

            <button
              id="tab-community"
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
            </button>

            <button
              id="tab-dual-phone"
              onClick={() => setActiveTab('dual-phone')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dual-phone'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>DTC Phone Sim</span>
            </button>
          </nav>

          {/* Quick Actions, Telemetry & Theme Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Ask Gemini Button */}
            <button
              id="btn-gemini-ask"
              onClick={openGeminiModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30' 
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100/80 shadow-2xs'
              }`}
              title="Legal Metrology AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Ask Gemini AI</span>
            </button>

            {/* Swagger / OpenAPI */}
            <button
              id="btn-swagger-specs"
              onClick={openSwagger}
              className={`p-2 rounded-lg transition-colors border cursor-pointer ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-transparent hover:border-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-200'
              }`}
              title="OpenAPI 3.0 / FastAPI Specs"
            >
              <Code2 className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors border cursor-pointer ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-transparent hover:border-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200 shadow-2xs'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Compliance Badge */}
            <div className={`hidden xl:flex items-center gap-2 pl-2 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-right">
                <div className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>STATUS</div>
                <div className={`text-xs font-bold font-mono ${
                  complianceScore === 100 
                    ? isDarkMode ? 'text-emerald-400' : 'text-emerald-700' 
                    : isDarkMode ? 'text-amber-400' : 'text-amber-700'
                }`}>
                  {complianceScore === 100 ? '100% PASSED' : `${complianceScore}% REVIEW`}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className={`md:hidden flex items-center justify-between py-2 border-t overflow-x-auto gap-2 no-scrollbar ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('audit-console')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'audit-console' 
                ? 'bg-teal-600 text-white' 
                : isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Dual Console
          </button>
          <button
            onClick={() => setActiveTab('camera-lab')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'camera-lab' 
                ? 'bg-teal-600 text-white' 
                : isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Camera Lab
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'certificate' 
                ? 'bg-teal-600 text-white' 
                : isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Certificate
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'community' 
                ? 'bg-teal-600 text-white' 
                : isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Community Hub
          </button>
          <button
            onClick={() => setActiveTab('dual-phone')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'dual-phone' 
                ? 'bg-teal-600 text-white' 
                : isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            DTC Phone
          </button>
        </div>
      </div>
    </header>
  );
};
