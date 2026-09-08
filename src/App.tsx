import React, { useState } from 'react';
import { AUDIT_PRESETS } from './data/presets';
import { AuditPreset } from './types';
import { Header, ActiveTab } from './components/Header';
import { DualAuditConsole } from './components/DualAuditConsole';
import { CameraInspectionLab } from './components/CameraInspectionLab';
import { StatutoryCertificate } from './components/StatutoryCertificate';
import { CommunityHub } from './components/CommunityHub';
import { DualPhoneSimulator } from './components/DualPhoneSimulator';
import { SwaggerModal } from './components/SwaggerModal';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { ShieldCheck, Scale, Cpu, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('audit-console');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentPreset, setCurrentPreset] = useState<AuditPreset>(AUDIT_PRESETS[0]);
  const [isSwaggerOpen, setIsSwaggerOpen] = useState<boolean>(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);
  const [geminiInitialQuery, setGeminiInitialQuery] = useState<string>('');

  const handleOpenGeminiWithQuery = (query: string) => {
    setGeminiInitialQuery(query);
    setIsGeminiModalOpen(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-slate-100/70 text-slate-900'
    }`}>
      
      {/* Universal Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        openSwagger={() => setIsSwaggerOpen(true)}
        openGeminiModal={() => {
          setGeminiInitialQuery('');
          setIsGeminiModalOpen(true);
        }}
        complianceScore={currentPreset.complianceScore}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'audit-console' && (
          <DualAuditConsole
            presets={AUDIT_PRESETS}
            currentPreset={currentPreset}
            setCurrentPreset={setCurrentPreset}
            isDarkMode={isDarkMode}
            onNavigateToCertificate={() => setActiveTab('certificate')}
            onOpenGeminiWithQuery={handleOpenGeminiWithQuery}
          />
        )}

        {activeTab === 'camera-lab' && (
          <CameraInspectionLab
            currentPreset={currentPreset}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'certificate' && (
          <StatutoryCertificate
            currentPreset={currentPreset}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'community' && (
          <CommunityHub
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'dual-phone' && (
          <DualPhoneSimulator
            isDarkMode={isDarkMode}
            onNavigateToConsole={() => setActiveTab('audit-console')}
          />
        )}

      </main>

      {/* Legal Metrology Footer (hidden when printing) */}
      <footer className={`mt-16 border-t py-8 no-print transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-md ${
              isDarkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-600/10 text-teal-700'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>LegalMetrology.AI</span>
            <span>&bull; Regulatory Engine PCR 2011 & Unit Sale Price Guidelines (2021/2022)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className={`flex items-center gap-1 font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
              <Scale className="w-3.5 h-3.5" />
              <span>MoCA Gazette Compliant</span>
            </span>
            <span>TrOCR-v3 &bull; FastAPI Microservice</span>
            <span>Version 2.4.0-prod</span>
          </div>

        </div>
      </footer>

      {/* Swagger / OpenAPI 3.0 Modal */}
      <SwaggerModal
        isOpen={isSwaggerOpen}
        onClose={() => setIsSwaggerOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Gemini AI Compliance Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        initialQuery={geminiInitialQuery}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
