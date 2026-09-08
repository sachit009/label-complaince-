import React, { useState } from 'react';
import { 
  COMMUNITY_DISCUSSIONS, 
  LIVE_HUDDLES, 
  FONT_HEIGHT_STANDARDS 
} from '../data/community';
import { CommunityDiscussion } from '../types';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Radio, 
  Plus, 
  Search, 
  Scale, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Send,
  Headphones
} from 'lucide-react';

interface CommunityHubProps {
  isDarkMode: boolean;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ isDarkMode }) => {
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>(COMMUNITY_DISCUSSIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Discussions');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHuddleId, setActiveHuddleId] = useState<string | null>(null);
  
  // Interactive Poll state
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState([68, 24, 8]); // Yes, No, Undecided %

  // New Discussion modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityDiscussion['category']>('Rule 6(1) Declarations');
  const [newContent, setNewContent] = useState('');
  const [newCitation, setNewCitation] = useState('');

  const categories = [
    'All Discussions',
    'Rule 6(1) Declarations',
    'OCR & Algorithms',
    'Enforcement & Penalties',
    'E-Commerce Guidelines'
  ];

  // Upvote toggle
  const handleUpvote = (id: string) => {
    setDiscussions(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, votes: d.votes + 1 };
      }
      return d;
    }));
  };

  const handleVotePoll = (index: number) => {
    if (selectedPollOption === null) {
      setSelectedPollOption(index);
      const newVotes = [...pollVotes];
      newVotes[index] += 1;
      setPollVotes(newVotes);
    }
  };

  const handleCreateDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDisc: CommunityDiscussion = {
      id: `disc-${Date.now()}`,
      author: {
        name: 'You (Regulatory Officer)',
        role: 'Compliance Lead',
        org: 'Statutory Metrology Desk',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        badge: 'Verified Officer'
      },
      title: newTitle,
      category: newCategory,
      content: newContent,
      votes: 1,
      commentsCount: 0,
      legalCitation: newCitation || 'Rule 6(1) Legal Metrology Rules, 2011',
      timestamp: 'Just now',
      tags: ['PCR 2011', newCategory.split(' ')[0]]
    };

    setDiscussions([newDisc, ...discussions]);
    setShowNewModal(false);
    setNewTitle('');
    setNewContent('');
    setNewCitation('');
  };

  const filteredDiscussions = discussions.filter(d => {
    const matchesCategory = selectedCategory === 'All Discussions' || d.category === selectedCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* Community Header Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Users className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-slate-100">
                Regulatory Metrology Community & Bar
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>247 Officers Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Peer review, case law precedents, compounding guidelines, and technical OCR benchmarks.
            </p>
          </div>
        </div>

        {/* Create Discussion Trigger */}
        <button
          id="btn-create-discussion"
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Discussion</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-teal-500/20 border-teal-500/60 text-teal-300 shadow-xs'
                  : isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rulings, statutes, tags..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

      </div>

      {/* Main 2-Column Community Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Discussion Feed (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredDiscussions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-400 text-xs">
              No discussions found matching your criteria. Try adjusting your search query.
            </div>
          ) : (
            filteredDiscussions.map((disc) => (
              <div
                key={disc.id}
                id={`disc-card-${disc.id}`}
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={disc.author.avatar}
                      alt={disc.author.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-200">{disc.author.name}</span>
                        {disc.author.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {disc.author.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{disc.author.role} &bull; {disc.author.org}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">{disc.timestamp}</span>
                </div>

                {/* Title & Content */}
                <h3 className="font-display font-bold text-base text-slate-100 hover:text-teal-300 transition-colors cursor-pointer mb-2">
                  {disc.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {disc.content}
                </p>

                {/* Legal Citation Pill */}
                {disc.legalCitation && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-teal-300/90 flex items-center gap-2 mb-3">
                    <Scale className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">Precedent: {disc.legalCitation}</span>
                  </div>
                )}

                {/* Tags & Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                  <div className="flex flex-wrap gap-1.5">
                    {disc.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Upvote & Comments */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpvote(disc.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="font-mono font-medium">{disc.votes}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="font-mono font-medium">{disc.commentsCount} replies</span>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Right Column: Huddles, Polls & Font Standards (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Live Audio Huddles Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Live Audio Huddles</span>
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                LIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {LIVE_HUDDLES.map((huddle) => (
                <div 
                  key={huddle.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-xs text-slate-200 leading-snug">
                      {huddle.title}
                    </h4>
                    <span className="text-[10px] font-mono text-teal-400 shrink-0">
                      {huddle.participants} listening
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {huddle.topic}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <img src={huddle.avatar} alt={huddle.host} className="w-4 h-4 rounded-full object-cover" />
                      <span className="truncate max-w-[130px]">{huddle.host}</span>
                    </div>

                    <button
                      onClick={() => setActiveHuddleId(activeHuddleId === huddle.id ? null : huddle.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                        activeHuddleId === huddle.id
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-teal-600 hover:bg-teal-500 text-white'
                      }`}
                    >
                      <Headphones className="w-3 h-3" />
                      <span>{activeHuddleId === huddle.id ? 'Leave' : 'Join'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Community Poll Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Community Pulse Poll</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">WEEK 08</span>
            </div>

            <p className="text-xs text-slate-200 font-medium">
              Should Rule 6(1)(e) Unit Sale Price requirements exempt single-serve consumer sachets priced under ₹10?
            </p>

            <div className="space-y-2">
              {[
                'Yes, excessive micro-printing leads to unreadable labels',
                'No, consumer price transparency must remain strictly universal',
                'Undecided / Requires Supreme Court clarification'
              ].map((option, idx) => {
                const isSelected = selectedPollOption === idx;
                const pct = pollVotes[idx];

                return (
                  <button
                    key={idx}
                    onClick={() => handleVotePoll(idx)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'border-teal-500/60 bg-teal-500/10 text-teal-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {/* Background Progress Bar */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-teal-500/10 pointer-events-none transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="leading-snug">{option}</span>
                      <span className="font-mono font-bold text-[11px] shrink-0 text-teal-400">
                        {pct}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 font-mono text-right">
              Total Responses: 1,842 verified members
            </div>
          </div>

          {/* Statutory Font Height Quick Reference Chart */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Font Height (Table 1 Rule 9)</span>
              </h3>
              <span className="text-[10px] font-mono text-teal-300">PCR 2011</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {FONT_HEIGHT_STANDARDS.map((std, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400 truncate">{std.pdpArea}</span>
                  <span className="text-teal-300 font-bold shrink-0">{std.minNumHeight}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* New Discussion Modal Dialog */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                <span>Create New Metrology Discussion</span>
              </h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Interpretation of Rule 6(1)(d) date stamping on foil sachets"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="Rule 6(1) Declarations">Rule 6(1) Declarations</option>
                  <option value="OCR & Algorithms">OCR & Algorithms</option>
                  <option value="Enforcement & Penalties">Enforcement & Penalties</option>
                  <option value="E-Commerce Guidelines">E-Commerce Guidelines</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Content & Findings:</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Elaborate on the regulatory conflict, court precedent, or packaging observation..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Statutory Citation (Optional):</label>
                <input
                  type="text"
                  value={newCitation}
                  onChange={(e) => setNewCitation(e.target.value)}
                  placeholder="e.g. Section 36(1) or Supreme Court precedent..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
