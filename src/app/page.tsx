"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Cpu, BookOpen, LayoutDashboard, User, Globe, FileText, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 가상 데이터 엔진 ---
const getCandidateStats = (name: string) => {
    const baseStats: Record<string, any> = {
        "신용한": { party: "더불어민주당", support: 9.6, influence: 0.92, risk: 18, winProb: 68 },
        "노영민": { party: "더불어민주당", support: 8.4, influence: 0.85, risk: 38, winProb: 45 },
        "송기섭": { party: "더불어민주당", support: 7.8, influence: 0.72, risk: 24, winProb: 32 },
        "이종배": { party: "국민의힘", support: 4.5, influence: 0.65, risk: 32, winProb: 18 },
    };
    return baseStats[name] || {
        party: "기타",
        support: 5.0,
        influence: 0.50,
        risk: 25,
        winProb: 15
    };
};

const getSimulationData = (names: string[]) => {
    return Array.from({ length: 12 }, (_, i) => {
        const row: any = { month: `${i + 1}월` };
        names.forEach(name => {
            row[name] = (getCandidateStats(name).support) + i * (Math.random() * 2);
        });
        return row;
    });
};

const getRelationshipMatrix = (names: string[]) => {
    const matrix: any[] = [];
    names.forEach(from => {
        names.forEach(to => {
            if (from !== to) {
                matrix.push({
                    from,
                    to,
                    strength: Math.floor(Math.random() * 80 + 20),
                    type: Math.random() > 0.6 ? "경쟁" : "잠재적 동맹"
                });
            }
        });
    });
    return matrix;
};

const CANDIDATE_COLORS = ["#3b82f6", "#ef4444", "#eab308", "#22c55e", "#a855f7"];

export default function PolisightDashboard() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('basecamp');
    const [inputText, setInputText] = useState("신용한, 노영민");
    const [targetNames, setTargetNames] = useState(["신용한", "노영민"]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Report Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

    const [multiStats, setMultiStats] = useState(targetNames.map(n => ({ name: n, ...getCandidateStats(n) })));
    const [simData, setSimData] = useState(getSimulationData(targetNames));
    const [relMatrix, setRelMatrix] = useState(getRelationshipMatrix(targetNames));

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRunAnalysis = () => {
        const names = inputText.split(/[ ,]+/).filter(n => n.trim() !== "");
        if (names.length === 0) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            setTargetNames(names);
            setMultiStats(names.map(n => ({ name: n, ...getCandidateStats(n) })));
            setSimData(getSimulationData(names));
            setRelMatrix(getRelationshipMatrix(names));
            setIsAnalyzing(false);
        }, 1200);
    };

    const openReport = (name: string) => {
        setSelectedCandidate(name);
        setIsModalOpen(true);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
            {/* --- DATA WAVE BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,204,0.12),transparent_70%)]" />
                <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" stroke="rgba(0,102,204,0.3)" strokeWidth="1" d="M0,400 Q360,300 720,400 T1440,400" className="animate-pulse" />
                </svg>
            </div>

            {/* --- TOP NAV BAR --- */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl px-6 lg:px-12 py-5 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">P</div>
                        <span className="text-2xl font-black tracking-tighter italic uppercase group-hover:text-blue-500 transition-colors">POLI<span className="text-blue-500">SIGHT</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Engine 4.0 Stable</span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-all hover:scale-110"><Bell size={22} /></button>
                    <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-blue-500/30 transition-all text-blue-400 shadow-xl overflow-hidden">
                        <User size={22} />
                    </div>
                </div>
            </nav>

            <main className="relative z-10 p-6 lg:p-12 max-w-[1600px] mx-auto">
                <header className="mb-20 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-center">
                        <span className="text-blue-500 text-[10px] font-black tracking-[0.5em] uppercase bg-blue-600/10 px-6 py-2 rounded-full border border-blue-500/30">Next-Gen Political Intelligence</span>
                    </motion.div>
                    <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 italic bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent uppercase">POLISIGHT COMMAND CENTER</h2>
                </header>

                {/* --- GLOBAL SEARCH PANEL --- */}
                <div className="max-w-5xl mx-auto mb-24">
                    <div className="relative group bg-white/[0.03] border border-white/10 rounded-[3rem] p-3 focus-within:border-blue-500/40 focus-within:bg-white/[0.05] transition-all shadow-2xl flex items-center gap-4">
                        <div className="flex-1 flex items-center px-8">
                            <Search className="text-gray-500 group-focus-within:text-blue-500 transition-colors mr-6" size={32} />
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="분석할 후보자들을 쉼표(,)로 구분하여 입력하세요..."
                                className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-gray-800"
                                onKeyPress={(e) => e.key === 'Enter' && handleRunAnalysis()}
                            />
                        </div>
                        <button
                            onClick={handleRunAnalysis}
                            disabled={isAnalyzing}
                            className="px-12 py-6 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 rounded-[2rem] font-black text-xl transition-all flex items-center gap-4 shadow-2xl shadow-blue-600/30 active:scale-95 group/btn"
                        >
                            {isAnalyzing ? (
                                <div className="w-7 h-7 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Zap size={24} className="text-yellow-400 group-hover/btn:scale-125 transition-transform" />
                                    <span>분석 시작</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- SECTION HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter italic border-l-4 border-blue-600 pl-6 uppercase">승률 시뮬레이션 지표</h3>
                        <p className="text-gray-500 text-sm mt-3 ml-7">후보별 이름을 클릭하여 작전 리포트를 생성하십시오.</p>
                    </div>
                </div>

                {/* --- CANDIDATE CARDS AS TARGETED BUTTONS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    <AnimatePresence mode="popLayout">
                        {multiStats.map((stat, i) => (
                            <motion.button
                                key={stat.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => openReport(stat.name)}
                                className="glass p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-blue-500/60 hover:scale-[1.02] transition-all group overflow-hidden relative text-left"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all" />
                                <div className="flex justify-between items-start mb-12 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-4xl font-black tracking-tighter group-hover:text-blue-400 transition-colors uppercase italic">{stat.name}</h4>
                                            <div className="p-1 px-2 bg-blue-600/20 rounded-lg text-[8px] font-black text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">REC: REPORT</div>
                                        </div>
                                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mt-2">{stat.party}</p>
                                    </div>
                                    <div style={{ color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length] }}>
                                        <Activity size={28} />
                                    </div>
                                </div>
                                <div className="flex items-end justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-bold mb-2 tracking-[0.2em] uppercase">WIN PROBABILITY</p>
                                        <h5 className="text-6xl font-black font-mono tracking-tighter">{stat.winProb}%</h5>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-600 font-bold mb-2 tracking-[0.2em] uppercase">RISK LEVEL</p>
                                        <h5 className="text-2xl font-black font-mono text-red-500">{stat.risk}%</h5>
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">View Detailed Strategy</span>
                                    <ChevronRight size={14} className="text-blue-500" />
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- MAIN ANALYTICS SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 glass p-12 rounded-[3.5rem] border border-white/10 bg-black/30 h-[600px] flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-2xl font-black italic flex items-center gap-4"><TrendingUp className="text-blue-500" /> 통합 지지율 변동 추세 분석</h3>
                            <div className="flex gap-4">
                                {targetNames.map((n, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length] }} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{n}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={simData}>
                                    <defs>
                                        {targetNames.map((_, i) => (
                                            <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} stopOpacity={0} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                    <XAxis dataKey="month" stroke="#444" fontSize={11} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#444" fontSize={11} axisLine={false} tickLine={false} unit="%" />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '20px', fontSize: '12px', padding: '15px' }} />
                                    {targetNames.map((name, i) => (
                                        <Area
                                            key={i}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}
                                            fill={`url(#grad${i})`}
                                            strokeWidth={5}
                                            animationDuration={1500}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass p-12 rounded-[3.5rem] border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col">
                        <h3 className="text-2xl font-black italic flex items-center gap-4 mb-6"><ShieldAlert className="text-red-500" /> 상호 경쟁 및 역학 분석</h3>
                        <div className="flex-1 space-y-7 custom-scrollbar overflow-y-auto pr-2">
                            {relMatrix.map((rel, i) => (
                                <div key={i} className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:border-blue-500/30 transition-all group">
                                    <div className="flex justify-between items-center mb-5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-black text-white/50">{rel.from}</span>
                                            <ChevronRight size={14} className="text-gray-700" />
                                            <span className="text-[13px] font-black text-white">{rel.to}</span>
                                        </div>
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${rel.type === '경쟁' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                            {rel.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${rel.strength}%` }} className="h-full bg-blue-600/70" />
                                        </div>
                                        <span className="text-[11px] font-mono font-black text-gray-500">{rel.strength}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAL: CANDIDATE-TARGETED REPORT --- */}
            <AnimatePresence>
                {isModalOpen && selectedCandidate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 shrink-0">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative w-full max-w-6xl bg-[#0a0a0c] border border-white/10 rounded-[4rem] shadow-2xl shadow-blue-500/15 overflow-hidden flex flex-col max-h-[92vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-900/10 to-transparent">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/50">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-4xl font-black tracking-tight italic uppercase">{selectedCandidate} 후보 맞춤형 전략 보고서</h2>
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg border border-blue-500/30 tracking-widest uppercase">Classified Assets</span>
                                        </div>
                                        <p className="text-gray-500 text-xs mt-2 uppercase tracking-[0.3em] font-black">Individually Targeted Strategic Win-Path Optimization</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-5 hover:bg-white/5 rounded-3xl transition-all text-gray-600 hover:text-white">
                                    <X size={36} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    {/* Column 1: Core Strategy */}
                                    <div className="space-y-12">
                                        <section>
                                            <h4 className="text-blue-500 text-[11px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                                <div className="w-12 h-[1px] bg-blue-500/50" />
                                                Strategic Position Analysis
                                            </h4>
                                            <div className="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={100} /></div>
                                                <h5 className="text-xl font-black mb-6 flex items-center gap-3">
                                                    <Activity size={20} className="text-blue-500" />
                                                    {selectedCandidate} 후보의 현재 위상
                                                </h5>
                                                <p className="text-gray-400 text-base leading-relaxed mb-8">
                                                    {selectedCandidate} 후보는 현재 <b>{getCandidateStats(selectedCandidate).winProb}%</b>의 당선 확률을 확보하고 있으며,
                                                    특히 조직 내에서의 결속력이 0.92 수준으로 매우 견고한 상태입니다.
                                                    다만, {targetNames.find(n => n !== selectedCandidate) || "상대"} 후보와의 접점 지역에서 지지층 잠식 리스크가 {getCandidateStats(selectedCandidate).risk}% 존재합니다.
                                                </p>
                                                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Core Strength</p>
                                                        <p className="text-sm font-black text-blue-400 italic">조직 결속 및 도심 지역 우세</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Main Threat</p>
                                                        <p className="text-sm font-black text-red-500 italic">외연 확장성 정체 및 네거티브 역풍</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className="text-blue-500 text-[11px] font-black uppercase tracking-[0.4em] mb-8">Win-Logic Breakdown</h4>
                                            <div className="space-y-8 pl-4">
                                                <div className="relative pl-8 border-l-2 border-white/5 hover:border-blue-600 transition-colors">
                                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-600" />
                                                    <h6 className="text-sm font-black text-white mb-2 uppercase">Scenario A: Hyper-Local Push</h6>
                                                    <p className="text-xs text-gray-500 leading-relaxed">청주권 지지세를 4%p 이상 추가 확보할 경우 시뮬레이션 기반 당선 확률이 82%까지 급등합니다.</p>
                                                </div>
                                                <div className="relative pl-8 border-l-2 border-white/5 hover:border-blue-600 transition-colors">
                                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-600" />
                                                    <h6 className="text-sm font-black text-white mb-2 uppercase">Scenario B: Defensive Consolidation</h6>
                                                    <p className="text-xs text-gray-500 leading-relaxed">북부 권역의 이탈 리스크를 현 수준에서 방어 시, 리스크 지수를 12%까지 낮추어 안정적인 장기 레이스 가능.</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Column 2: Data Visuals & Tactical Advice */}
                                    <div className="space-y-12">
                                        <section className="glass p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10 text-center">Demographic Target Performance</h4>
                                            <ResponsiveContainer width="100%" height={240}>
                                                <BarChart data={[
                                                    { age: '20s', value: 45 }, { age: '30s', value: 72 }, { age: '40s', value: 85 },
                                                    { age: '50s', value: 50 }, { age: '60s+', value: 38 }
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                                    <XAxis dataKey="age" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '15px' }} />
                                                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                                        {[45, 72, 85, 50, 38].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === 2 ? '#3b82f6' : '#ffffff10'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <p className="text-[10px] text-gray-600 mt-8 text-center italic leading-relaxed">
                                                * {selectedCandidate} 후보는 특히 40대 유권자 그룹에서의 당선 기여도가 독보적입니다.<br />이 계층의 충성도를 유지하며 30대 유권자층을 공략하는 전략이 필수적입니다.
                                            </p>
                                        </section>

                                        <section className="p-12 bg-blue-600 rounded-[3.5rem] shadow-2xl shadow-blue-600/40 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:rotate-0 transition-transform"><Zap size={60} fill="#fff" /></div>
                                            <div className="flex items-center gap-4 mb-8">
                                                <Activity className="text-white" size={28} />
                                                <h4 className="text-2xl font-black italic uppercase tracking-tight text-white">Tactical Guidance</h4>
                                            </div>
                                            <p className="text-blue-100 text-lg leading-relaxed mb-8 font-medium">
                                                "{selectedCandidate} 후보님, 현재 지표상 시급한 과제는 <b>청주권 30대 중도층</b>에 대한 선제적 프레임 선점입니다.
                                                상대 후보의 지연/학연 지지층의 틈새를 공략하기 위해 '미래 산업 중심의 지역 비전'을 강력히 피력할 것을 권고합니다."
                                            </p>
                                            <div className="flex gap-4">
                                                <div className="text-[10px] font-black uppercase text-blue-900 bg-white/30 px-4 py-2 rounded-xl border border-white/20">Operational Priority 01</div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 border-t border-white/5 text-center bg-white/[0.01]">
                                <p className="text-[11px] font-black text-gray-700 tracking-[0.6em] uppercase">Polisight Intelligence Report Engine v4.2 • Individually Synchronized</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <footer className="relative z-50 border-t border-white/5 mt-32 py-12 px-12 flex flex-col items-center gap-6">
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.6em]">Polisight Intelligence Systems &copy; 2026</p>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.4); }
            `}</style>
        </div>
    );
}
