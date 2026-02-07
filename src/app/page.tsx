"use client";

import React, { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Cpu, BookOpen, LayoutDashboard, User, Globe, FileText, X, PieChart as PieIcon, BarChart3, Info
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

const CANDIDATE_COLORS = ["#3b82f6", "#ef4444", "#fbbf24", "#10b981", "#a855f7", "#ec4899"];

export default function PolisightDashboard() {
    const [mounted, setMounted] = useState(false);
    const [inputText, setInputText] = useState("신용한, 노영민, 송기섭");
    const [targetNames, setTargetNames] = useState(["신용한", "노영민", "송기섭"]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Report Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'individual' | 'all'>('all');
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

    const openIndividualReport = (name: string) => {
        setSelectedCandidate(name);
        setModalMode('individual');
        setIsModalOpen(true);
    };

    const openAllReport = () => {
        setModalMode('all');
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
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">P</div>
                        <span className="text-2xl font-black tracking-tighter italic uppercase group-hover:text-blue-500 transition-colors">POLI<span className="text-blue-500">SIGHT</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-8 text-[11px] font-black tracking-[0.3em] uppercase opacity-40 hidden md:block">
                    Operational Intelligence Unit
                </div>
                <div className="flex items-center gap-8">
                    <button className="text-gray-400 hover:text-white transition-all"><Bell size={22} /></button>
                    <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-blue-500/30 transition-all text-blue-400 shadow-xl">
                        <User size={22} />
                    </div>
                </div>
            </nav>

            <main className="relative z-10 p-6 lg:p-12 max-w-[1600px] mx-auto">
                {/* --- HEADER --- */}
                <header className="mb-20 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-center">
                        <span className="text-blue-500 text-[10px] font-black tracking-[0.5em] uppercase bg-blue-600/10 px-6 py-2 rounded-full border border-blue-500/30">Strategic Command Surface v4.5</span>
                    </motion.div>
                    <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 italic bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent uppercase">POLISIGHT COMMAND CENTER</h2>
                </header>

                {/* --- SEARCH PANEL --- */}
                <div className="max-w-5xl mx-auto mb-24">
                    <div className="relative group bg-white/[0.03] border border-white/10 rounded-[3rem] p-3 focus-within:border-blue-500/40 focus-within:bg-white/[0.05] transition-all shadow-2xl flex items-center gap-4">
                        <div className="flex-1 flex items-center px-8">
                            <Search className="text-gray-500 group-focus-within:text-blue-500 transition-colors mr-6" size={32} />
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="분석할 후보자들을 입력하세요..."
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

                {/* --- SECTION HEADER WITH ALL ANALYSIS BUTTON --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter italic border-l-4 border-blue-600 pl-6 uppercase">승률 시뮬레이션 지표</h3>
                        <p className="text-gray-500 text-sm mt-3 ml-7">개별 후보 클릭 시 맞춤형 리포트, 우측 버튼 클릭 시 전체 판세 요약을 제공합니다.</p>
                    </div>
                    <button
                        onClick={openAllReport}
                        className="group flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-blue-500/20"
                    >
                        <BarChart3 size={24} />
                        <div className="text-left">
                            <p className="text-[10px] font-black text-blue-100 opacity-60 uppercase tracking-widest leading-none mb-1">Total Intelligence</p>
                            <span className="text-lg font-black tracking-tight">전방위 판세 분석 리포트</span>
                        </div>
                        <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* --- CANDIDATE CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    <AnimatePresence mode="popLayout">
                        {multiStats.map((stat, i) => (
                            <motion.button
                                key={stat.name}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => openIndividualReport(stat.name)}
                                className="glass p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-blue-500/50 hover:bg-white/[0.06] transition-all group overflow-hidden relative text-left"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all" />
                                <div className="flex justify-between items-start mb-12 relative z-10">
                                    <div>
                                        <h4 className="text-4xl font-black tracking-tighter group-hover:text-blue-400 transition-colors uppercase italic">{stat.name}</h4>
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
                                <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5 opacity-50">
                                    <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-blue-400">View Tactical Report</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- MAIN ANALYTICS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 glass p-12 rounded-[3.5rem] border border-white/10 bg-black/30 h-[600px] flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-2xl font-black italic flex items-center gap-4 uppercase"><TrendingUp className="text-blue-500" /> 통합 지지율 변동 추세</h3>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="90%">
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
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '20px' }} />
                                    {targetNames.map((name, i) => (
                                        <Area key={i} type="monotone" dataKey={name} stroke={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} fill={`url(#grad${i})`} strokeWidth={5} />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="glass p-12 rounded-[3.5rem] border border-white/10 flex flex-col">
                        <h3 className="text-2xl font-black italic mb-10 flex items-center gap-4 uppercase"><ShieldAlert className="text-red-500" /> 역학 분석</h3>
                        <div className="flex-1 space-y-7 overflow-y-auto pr-2 custom-scrollbar">
                            {relMatrix.map((rel, i) => (
                                <div key={i} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-gray-400 capitalize">{rel.from} → {rel.to}</span>
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full ${rel.type === '경쟁' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{rel.type}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500/50" style={{ width: `${rel.strength}%` }} />
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-600">{rel.strength}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- REPORT MODAL (Individual & All) --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 shrink-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="relative w-full max-w-6xl bg-[#0a0a0c] border border-white/10 rounded-[4rem] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-900/10 to-transparent">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl ${modalMode === 'all' ? 'bg-blue-600 shadow-blue-600/50' : 'bg-white/5 border border-white/10'}`}>
                                        {modalMode === 'all' ? <BarChart3 size={32} /> : <FileText size={32} />}
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black italic uppercase">
                                            {modalMode === 'all' ? "종합 인텔리전스 상시 분석 리포트" : `${selectedCandidate} 후보 전략 최적화 보고서`}
                                        </h2>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
                                            {modalMode === 'all' ? "Consolidated Strategic Market Landscape Overview" : "Individually Synchronized Tactical Assessment"}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-6 hover:bg-white/5 rounded-3xl transition-all"><X size={36} /></button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                {modalMode === 'all' ? (
                                    /* ALL REPORT UI */
                                    <div className="space-y-20">
                                        {/* Row 1: Market Structure & Bubble Chart Concept */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                            <section>
                                                <h4 className="text-blue-500 text-[11px] font-black uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
                                                    <div className="w-12 h-[1px] bg-blue-500/50" />
                                                    Integrated Market Landscape
                                                </h4>
                                                <div className="p-12 bg-white/[0.02] rounded-[3rem] border border-white/5 border-l-8 border-l-blue-600 shadow-2xl">
                                                    <h5 className="text-2xl font-black mb-8 italic flex items-center gap-4">
                                                        <Activity className="text-blue-500" /> AI 종합 판세 평가
                                                    </h5>
                                                    <p className="text-xl text-gray-300 leading-relaxed font-light italic">
                                                        "현재 충북도지사 선거 판세는 <b>{targetNames[0]} 후보의 1강 구도</b> 속에 {targetNames[1]} 후보가 맹추격하는 양상입니다.
                                                        특히 중도층 부동표가 전체의 <b>15.4%</b>에 달해, 막판 네트워크 이슈 선점이 최종 승패를 가를 것으로 예측됩니다."
                                                    </p>
                                                    <div className="mt-12 grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Voter Energy</p>
                                                            <p className="text-2xl font-mono font-black text-blue-500">88.4</p>
                                                        </div>
                                                        <div className="text-center border-l border-white/5">
                                                            <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Competition</p>
                                                            <p className="text-2xl font-mono font-black text-red-500">HIGH</p>
                                                        </div>
                                                        <div className="text-center border-l border-white/5">
                                                            <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Stability</p>
                                                            <p className="text-2xl font-mono font-black text-gray-400">MID</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="glass p-12 rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                                                <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-12 text-center">전체 후보별 당선 확률 비교</h4>
                                                <ResponsiveContainer width="100%" height={280}>
                                                    <BarChart data={multiStats}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                                        <XAxis dataKey="name" stroke="#555" fontSize={11} axisLine={false} tickLine={false} />
                                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '15px' }} />
                                                        <Bar dataKey="winProb" radius={[12, 12, 0, 0]}>
                                                            {multiStats.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={CANDIDATE_COLORS[index % CANDIDATE_COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                                <p className="mt-10 text-[10px] text-gray-600 text-center italic">
                                                    * 데이터 기반 누적 예측 확률이며, 오차 범위는 ±3.2%p입니다.
                                                </p>
                                            </section>
                                        </div>

                                        {/* Row 2: Demographic Dominance Heatmap Concept */}
                                        <section>
                                            <h4 className="text-blue-500 text-[11px] font-black uppercase tracking-[0.5em] mb-12 text-center">세대별 지표 우위 분석 (Demographic Dominance)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                                {['20대', '30대', '40대', '50대', '60대+'].map((age, i) => (
                                                    <div key={i} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] text-center hover:border-blue-500/30 transition-all">
                                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">{age} 우위 후보</p>
                                                        <h6 className="text-xl font-black italic">{targetNames[i % targetNames.length]}</h6>
                                                        <div className="mt-4 h-1.5 bg-blue-600/20 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-600" style={{ width: `${80 - i * 10}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Row 3: Final Intelligence Summary */}
                                        <section className="bg-blue-600 p-16 rounded-[4rem] shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform"><BookOpen size={200} /></div>
                                            <h5 className="text-3xl font-black italic text-white mb-10 flex items-center gap-6">
                                                <Zap className="text-yellow-400 fill-yellow-400" /> 폴리사이트 종합 전략 권고
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div className="p-8 bg-white/10 rounded-3xl border border-white/10">
                                                    <h6 className="text-[12px] font-black text-blue-200 uppercase mb-4 tracking-widest">Main Scenario</h6>
                                                    <p className="text-white text-base leading-relaxed">충북 남부권의 {targetNames[1]} 후보 지지세가 정체기에 접어들었습니다. {targetNames[0]} 후보가 청주 흥덕/상당 지역의 3040 세대를 선점할 경우, 골든크로스 없이 승리가 확정될 가능성이 농후합니다.</p>
                                                </div>
                                                <div className="p-8 bg-white/10 rounded-3xl border border-white/10">
                                                    <h6 className="text-[12px] font-black text-blue-200 uppercase mb-4 tracking-widest">Critical Alert</h6>
                                                    <p className="text-white text-base leading-relaxed">전체 후보자군 사이의 지지층 중복도가 22% 이상으로 나타납니다. 이는 단 한 번의 네트워크 스캔들로도 지지층이 도미노처럼 무너질 수 있는 고위험 혼전 구조임을 의미합니다.</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                ) : (
                                    /* INDIVIDUAL REPORT UI (Same as before but refined) */
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                        <div className="space-y-12">
                                            <section>
                                                <h4 className="text-blue-500 text-[11px] font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                                                    <div className="w-12 h-[1px] bg-blue-500/50" />
                                                    Strategic Assessment
                                                </h4>
                                                <div className="p-10 bg-white/[0.03] rounded-[3rem] border border-white/5">
                                                    <h5 className="text-2xl font-black mb-6 italic">{selectedCandidate} 후보 핵심 리포트</h5>
                                                    <p className="text-gray-400 text-lg leading-relaxed italic">
                                                        {selectedCandidate} 후보는 현재 <b>{getCandidateStats(selectedCandidate!).winProb}%</b>의 승률을 보이고 있습니다.
                                                        조직 장악력은 우수하나 리스크 지수가 <b>{getCandidateStats(selectedCandidate!).risk}%</b>로 감지되므로 외연 확장이 최우선 과제입니다.
                                                    </p>
                                                </div>
                                            </section>
                                            <section className="p-10 bg-blue-600 rounded-[3rem]">
                                                <h5 className="text-xl font-black text-white mb-6 italic">개별 작전 제언</h5>
                                                <p className="text-blue-50 text-base leading-relaxed">
                                                    "{selectedCandidate} 후보님, 현재 충북 중부권역의 40대 중도층 흡수율을 5%만 올리면 승률이 15%p 변동하는 임계점에 있습니다. 정책 가시성을 더욱 선명하게 확보하십시오."
                                                </p>
                                            </section>
                                        </div>
                                        <section className="glass p-12 rounded-[3.5rem] border border-white/5">
                                            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-12 text-center">세대별 당선 기여도 시뮬레이션</h4>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie data={[
                                                        { name: '20-30s', val: 30 }, { name: '40s', val: 45 }, { name: '50s+', val: 25 }
                                                    ]} innerRadius={60} outerRadius={100} paddingAngle={10} dataKey="val">
                                                        <Cell fill="#3b82f6" /><Cell fill="#2563eb" /><Cell fill="#ffffff05" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </section>
                                    </div>
                                )}
                            </div>

                            <div className="p-10 border-t border-white/5 text-center bg-white/[0.01]">
                                <p className="text-[11px] font-black text-gray-700 tracking-[0.6em] uppercase italic">Polisight Intelligence Systems Center • Classified Strategic Assets</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <footer className="relative z-50 border-t border-white/5 mt-32 py-12 px-12 flex flex-col items-center">
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.6em]">Polisight Intelligence &copy; 2026</p>
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
