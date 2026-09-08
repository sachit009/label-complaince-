import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Scale, ShieldAlert, BookOpen, Check } from 'lucide-react';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  isDarkMode: boolean;
}

interface Message {
  role: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  isDarkMode
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'gemini',
      text: 'Greetings. I am your Gemini Legal Metrology Regulatory Assistant. I evaluate packaging label compliance under the Legal Metrology Act 2009, Packaged Commodities Rules 2011 (PCR 2011), and the 2021 Unit Sale Price amendments. How can I assist your compliance audit?',
      timestamp: '14:32'
    }
  ]);
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isTyping, setIsTyping] = useState(false);

  // If initialQuery changes and modal opens
  React.useEffect(() => {
    if (initialQuery && isOpen) {
      handleUserSubmit(initialQuery);
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const handleUserSubmit = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Formulate comprehensive Legal Metrology response
    setTimeout(() => {
      let reply = '';
      const q = queryText.toLowerCase();

      if (q.includes('section 36') || q.includes('penalty') || q.includes('compounding') || q.includes('fine')) {
        reply = `**Statutory Penalty Analysis under Section 36 & Rule 32 of Legal Metrology Act, 2009:**\n\n1. **First Offence:** Non-compliance with Rule 6(1) (such as missing Unit Sale Price, absent Customer Care contact, or non-standard metric symbols) carries a compounding fine up to **₹25,000**.\n2. **Second Offence:** Compounding fee escalates to **₹50,000**.\n3. **Subsequent Offences:** Direct prosecution under Section 36(1) with a fine up to **₹1,00,000**, or imprisonment up to **one year**, or both.\n4. **Corporate Liability:** Directors and designated Nominated Managers under Section 49 may be held personally liable unless due diligence is demonstrated.`;
      } else if (q.includes('rule 9') || q.includes('font') || q.includes('height') || q.includes('size')) {
        reply = `**Rule 9 Font Height Standards (Table 1, PCR 2011):**\n\n- **Area of PDP ≤ 50 cm²:** Minimum numeral height is **1.0 mm** (for blister packs) / **1.5 mm** (general packages).\n- **50 cm² < Area ≤ 100 cm²:** Minimum numeral height is **2.0 mm**, letter height **1.5 mm**.\n- **100 cm² < Area ≤ 500 cm²:** Minimum numeral height is **4.0 mm**, letter height **2.0 mm**.\n- **Cylindrical Containers:** The Principal Display Panel (PDP) equals **40% of the total surface area** (Area = 0.40 × π × diameter × height).`;
      } else if (q.includes('usp') || q.includes('unit sale price') || q.includes('price')) {
        reply = `**Mandatory Unit Sale Price (USP) Guidelines (PCR 2021 Amendment):**\n\n- Commenced effective **1 December 2022**.\n- Required on all packaged commodities with net quantity exceeding 1 unit / 1 gram / 1 millilitre.\n- Format: "₹ X.XX per g" or "₹ X.XX per ml" (or per piece / N for discrete goods).\n- Must appear directly adjacent to or inside the Maximum Retail Price (MRP) declaration with equal prominence.`;
      } else if (q.includes('exemption') || q.includes('rule 26')) {
        reply = `**Exemptions under Rule 26 of PCR 2011:**\n\n1. Packages containing commodities with net weight or measure of **10 grams or 10 millilitres or less** (except tobacco and gutkha).\n2. Packages containing fast food items packed by restaurants or hotels.\n3. Agricultural produce in packages exceeding **50 kg**.\n4. Scheduled drugs covered under the Drugs (Prices Control) Order (DPCO).`;
      } else {
        reply = `**Legal Metrology Rule 6(1) Advisory:**\n\nEvery pre-packaged commodity in India must carry the 6 statutory declarations on its Principal Display Panel (PDP):\n- **6(1)(a):** Name & complete address of Manufacturer, Packer, or Importer.\n- **6(1)(b):** Common or generic name of the commodity.\n- **6(1)(c):** Net quantity in standard SI metric units (g, kg, ml, l, or N).\n- **6(1)(d):** Month and year of manufacture, packing, or import.\n- **6(1)(e):** Maximum Retail Price (MRP) "inclusive of all taxes" + Unit Sale Price (USP).\n- **6(1)(f):** Name, address, telephone number, and email of consumer redressal officer.\n\nWould you like me to inspect a specific declaration on your active sample?`;
      }

      const geminiMsg: Message = {
        role: 'gemini',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, geminiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full h-[600px] flex flex-col shadow-2xl text-slate-100 font-sans overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base flex items-center gap-2">
                <span>Gemini Compliance Legal Advisor</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  PCR-2011 Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">Grounded in the Legal Metrology Act, 2009 & Supreme Court Precedents</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs leading-relaxed no-scrollbar">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'gemini' && (
                <div className="w-7 h-7 rounded-lg bg-teal-600/30 text-teal-400 border border-teal-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] p-3.5 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-br-none' 
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-line'
              }`}>
                {msg.text}
                <div className={`text-[9px] font-mono mt-1 text-right ${msg.role === 'user' ? 'text-teal-200' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-slate-400 text-xs font-mono">
              <Bot className="w-4 h-4 text-teal-400 animate-spin" />
              <span>Analyzing Legal Metrology provisions...</span>
            </div>
          )}
        </div>

        {/* Quick Query Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            'Section 36 Compounding Fines',
            'Rule 9 Font Height Table',
            'Rule 26 Exemption Limits',
            'Unit Sale Price Rules 2021'
          ].map((pill, i) => (
            <button
              key={i}
              onClick={() => handleUserSubmit(pill)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUserSubmit(inputQuery);
              }
            }}
            placeholder="Ask a question on PCR 2011, compounding fees, or font sizing..."
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={() => handleUserSubmit(inputQuery)}
            className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
