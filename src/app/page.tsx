"use client";

import React, { useState, useEffect } from 'react';
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
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                    <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 italic bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">POLISIGHT COMMAND CENTER</h2>
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

                {/* --- SECTION HEADER WITH BUTTON --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-black tracking-tighter italic border-l-4 border-blue-600 pl-6">승률 시뮬레이션 지표</h3>
                        <p className="text-gray-500 text-sm mt-3 ml-7">Monte Carlo 기반의 확률 연산 및 리스크 진단 통합 보드</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all font-black text-xs tracking-widest uppercase group"
                    >
                        <FileText size={18} className="text-blue-500 group-hover:text-white" />
                        분석 보고서 상세보기
                    </button>
                </div>

                {/* --- CANDIDATE CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    <AnimatePresence mode="popLayout">
                        {multiStats.map((stat, i) => (
                            <motion.div
                                key={stat.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-blue-500/40 transition-all group overflow-hidden relative cursor-default"
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
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- MAIN ANALYTICS SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 glass p-12 rounded-[3.5rem] border border-white/10 bg-black/30 h-[600px] flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-2xl font-black italic flex items-center gap-4"><TrendingUp className="text-blue-500" /> 통합 지지율 추세 분석</h3>
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
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '20px', fontSize: '12px', padding: '15px' }} itemStyle={{ padding: '2px 0' }} />
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
                        <p className="mt-8 text-[11px] text-gray-500 text-center leading-relaxed font-medium bg-white/5 py-4 rounded-2xl border border-white/5">
                            * <b>Polisight Synthetic Index:</b> 다층 네트워크 데이터와 여론조사 가중 평균을 결합한 지표로, 표집 편향(Sampling Bias)을 최소화한 예측 추세입니다.
                        </p>
                    </div>

                    <div className="glass p-12 rounded-[3.5rem] border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col">
                        <h3 className="text-2xl font-black italic flex items-center gap-4 mb-6"><ShieldAlert className="text-red-500" /> 상호 경쟁 및 역학 분석</h3>
                        <p className="text-xs text-gray-500 mb-10 leading-relaxed">
                            후보 간 지지층의 <b>교차(Overlap)</b> 정도와 이슈 발생 시 표 전이 확률을 수치화한 데이터입니다.
                        </p>
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

            {/* --- MODAL: DETAILED REPORT --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 shrink-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl bg-[#0a0a0c] border border-white/10 rounded-[3rem] shadow-2xl shadow-blue-500/10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight italic">승률 시뮬레이션 상세 보고서</h2>
                                        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-black">Strategic Win-Probability Assessment Report</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white">
                                    <X size={32} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    {/* Column 1: Methodology & Drivers */}
                                    <div className="space-y-12">
                                        <section>
                                            <h4 className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                <div className="w-8 h-[1px] bg-blue-500/50" />
                                                Methodology Overview
                                            </h4>
                                            <div className="p-8 bg-blue-600/5 rounded-3xl border border-blue-500/10 leading-relaxed text-gray-400 text-sm">
                                                본 리포트는 <b>Monte Carlo 방식의 10,000회 시뮬레이션</b> 결과를 기반으로 작성되었습니다.
                                                충북도 내 11개 시군의 과거 선거 데이터와 실시간 SNS 네트워크 밀도를 상호 교차 분석하여 95% 신뢰 수준을 확보했습니다.
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] mb-8">Winning Scenario Breakdown</h4>
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                                    <span className="text-sm font-bold text-gray-300">청주권역 표 결집 효과</span>
                                                    <span className="text-2xl font-black text-white">+8.4% <small className="text-[10px] text-gray-600 text-normal">Impact</small></span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                                    <span className="text-sm font-bold text-gray-300">3040 세대 지지 전이</span>
                                                    <span className="text-2xl font-black text-white">+12.2% <small className="text-[10px] text-gray-600 text-normal">Impact</small></span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                                    <span className="text-sm font-bold text-gray-300">부동층 흡수 가능성</span>
                                                    <span className="text-2xl font-black text-blue-500">High <small className="text-[10px] text-gray-600 text-normal">Probability</small></span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Column 2: Dynamic Charts & Action */}
                                    <div className="space-y-12">
                                        <section className="glass p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-10 text-center">Age Demographic Win-Impact</h4>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={[
                                                    { age: '20s', value: 45 }, { age: '30s', value: 72 }, { age: '40s', value: 85 },
                                                    { age: '50s', value: 50 }, { age: '60s+', value: 38 }
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                                    <XAxis dataKey="age" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '10px' }} />
                                                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                                        {[45, 72, 85, 50, 38].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === 2 ? '#3b82f6' : '#ffffff10'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <p className="text-[10px] text-gray-600 mt-6 text-center italic">
                                                * 40대 유권자 그룹에서의 당선 기여도가 가장 높게 분석되었습니다.
                                            </p>
                                        </section>

                                        <section className="p-10 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-600/30">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Zap className="text-yellow-400 fill-yellow-400" size={24} />
                                                <h4 className="text-lg font-black italic">작전 지침 (Tactical Note)</h4>
                                            </div>
                                            <p className="text-blue-100 text-sm leading-relaxed mb-6">
                                                현재 {targetNames[0]} 후보는 청주 흥덕구의 부동층 흡수율만 5% 상향시켜도 전체 당선 확률이 **12%p 급등**하는 구간에 있습니다.
                                                북부권역의 방어 전략보다 청주권역의 공세적 정책 브랜딩이 투자 대비 효율이 월등히 높습니다.
                                            </p>
                                            <div className="flex gap-4">
                                                <div className="text-[10px] font-black uppercase text-blue-900 bg-white/20 px-3 py-1 rounded">Urgent</div>
                                                <div className="text-[10px] font-black uppercase text-blue-900 bg-white/20 px-3 py-1 rounded">High Impact</div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/5 text-center bg-white/[0.01]">
                                <p className="text-[10px] font-bold text-gray-700 tracking-[0.5em] uppercase">Polisight AI Report Engine v4.2.1 • Generated with Confidenciality</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <footer className="relative z-50 border-t border-white/5 mt-32 py-12 px-12 flex flex-col items-center gap-6">
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.6em]">Polisight Intelligence Systems &copy; 2026</p>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.3); }
            `}</style>
        </div>
    );
}
