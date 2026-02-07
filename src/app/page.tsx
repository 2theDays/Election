"use client";

import React, { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Cpu, BookOpen, LayoutDashboard, User, Globe
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
        support: Math.floor(Math.random() * 5) + 3,
        influence: (Math.random() * 0.5 + 0.3).toFixed(2),
        risk: Math.floor(Math.random() * 40),
        winProb: Math.floor(Math.random() * 30)
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

// 후보별 전용 컬러 팔레트
const CANDIDATE_COLORS = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#eab308", // Yellow
    "#22c55e", // Green
    "#a855f7", // Purple
    "#ec4899"  // Pink
];

export default function PolisightDashboard() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('basecamp');
    const [inputText, setInputText] = useState("신용한, 노영민");
    const [targetNames, setTargetNames] = useState(["신용한", "노영민"]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    const navItems = [
        { id: 'basecamp', label: '작전 베이스캠프', icon: LayoutDashboard },
        { id: 'simulation', label: '전략 시뮬레이터', icon: Cpu },
        { id: 'district', label: '로컬 표심지도', icon: Map },
        { id: 'expert', label: '전문가 브리핑', icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans overflow-x-hidden">
            {/* --- DATA WAVE BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,204,0.1),transparent_70%)]" />
                <svg className="absolute w-full h-full opacity-30" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" stroke="rgba(0,102,204,0.3)" strokeWidth="1" d="M0,400 Q360,300 720,400 T1440,400" className="animate-pulse" />
                </svg>
            </div>

            {/* --- TOP NAV BAR --- */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl px-4 lg:px-12 py-4 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-blue-600/30">P</div>
                        <span className="text-xl font-black tracking-tighter uppercase italic">POLI<span className="text-blue-500">SIGHT</span></span>
                    </div>
                    <div className="hidden lg:flex items-center gap-8">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`text-[11px] font-black tracking-[0.2em] transition-all uppercase ${activeTab === item.id ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : 'text-gray-500 hover:text-white'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-blue-400 cursor-pointer">
                        <User size={20} />
                    </div>
                </div>
            </nav>

            <main className="relative z-10 p-4 lg:p-12 max-w-[1600px] mx-auto">
                {/* --- PROGRAM HEADER --- */}
                <header className="mb-16 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                        <span className="text-blue-500 text-xs font-black tracking-[0.4em] uppercase bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">The Future of Election Intelligence</span>
                    </motion.div>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent italic">POLISIGHT COMMAND CENTER</h2>
                    <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
                        폴리사이트는 인공지능과 다층 네트워크 분석을 통해 단순 조사를 넘어 실질적인 당선 루트를 설계합니다.<br />
                        데이터의 깊이가 만드는 압도적인 전략의 차이를 경험하십시오.
                    </p>
                </header>

                {/* --- GLOBAL SEARCH & ACTION --- */}
                <div className="max-w-4xl mx-auto mb-20 relative">
                    <div className="relative group flex items-center bg-white/5 border border-white/10 rounded-[2.5rem] p-2 pr-4 focus-within:border-blue-500/50 transition-all shadow-2xl">
                        <div className="flex-1 flex items-center px-6 py-4">
                            <Search className="text-gray-500 group-focus-within:text-blue-500 transition-colors mr-4" size={28} />
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleRunAnalysis()}
                                placeholder="분석할 후보자들을 입력하세요 (쉼표로 구분)"
                                className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-gray-700"
                            />
                        </div>
                        <button
                            onClick={handleRunAnalysis}
                            disabled={isAnalyzing}
                            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 rounded-3xl font-black text-lg transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 border-b-4 border-blue-800"
                        >
                            {isAnalyzing ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Zap size={22} className="text-yellow-400 fill-yellow-400" />
                                    <span>분석 시작</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'basecamp' && (
                        <motion.div key="base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                            {/* CANDIDATE CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {multiStats.map((stat, i) => (
                                    <div key={i} className="glass p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all" />
                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                            <div>
                                                <h4 className="text-3xl font-black tracking-tighter group-hover:text-blue-400 transition-colors">{stat.name}</h4>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{stat.party}</p>
                                            </div>
                                            <div style={{ color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length] }}>
                                                <Activity size={24} />
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between relative z-10">
                                            <div>
                                                <p className="text-[10px] text-gray-600 font-bold mb-1 tracking-widest uppercase">PROBABILITY</p>
                                                <h5 className="text-5xl font-mono font-black">{stat.winProb}%</h5>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-600 font-bold mb-1 tracking-widest uppercase">RISK</p>
                                                <h5 className="text-xl font-mono font-bold text-red-500">{stat.risk}%</h5>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* MAIN CHARTS SECTION */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* CHART 1: TREND */}
                                <div className="lg:col-span-2 glass p-10 rounded-[2.5rem] border border-white/5 bg-black/20 h-[550px] flex flex-col">
                                    <h3 className="text-xl font-black mb-4 flex items-center gap-3 italic"><TrendingUp className="text-blue-500" /> 통합 지지율 변동 추이</h3>
                                    <p className="text-xs text-gray-500 mb-10 leading-relaxed font-medium">
                                        * 공표된 여론조사 및 네트워크 결집도를 보정한 **폴리사이트 지표(Polisight Index)**입니다. 시간에 따른 후보군 간의 지지세 역학을 시뮬레이션한 결과입니다.
                                    </p>
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
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
                                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '16px', fontSize: '12px' }} />
                                                <Legend iconType="circle" />
                                                {targetNames.map((name, i) => (
                                                    <Area
                                                        key={i}
                                                        type="monotone"
                                                        dataKey={name}
                                                        stroke={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}
                                                        fill={`url(#grad${i})`}
                                                        strokeWidth={4}
                                                        animationDuration={1500}
                                                    />
                                                ))}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* CHART 2: RELATIONSHIP */}
                                <div className="glass p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col">
                                    <h3 className="text-xl font-black mb-4 flex items-center gap-3 italic"><ShieldAlert className="text-red-500" /> 상호 경쟁 및 역학 분석</h3>
                                    <p className="text-xs text-gray-500 mb-8 leading-relaxed font-medium">
                                        * 후보 간 지지층의 <b>잠식(Cannibalization)</b> 및 <b>전이(Transfer)</b> 가능성을 네트워크 엣지 분석으로 도출했습니다.
                                    </p>
                                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                        {relMatrix.map((rel, i) => (
                                            <div key={i} className="p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-blue-500/30 transition-all">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-gray-300">{rel.from}</span>
                                                        <ChevronRight size={12} className="text-gray-600" />
                                                        <span className="text-xs font-black text-white">{rel.to}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${rel.type === '경쟁' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                        {rel.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${rel.strength}%` }} className="h-full bg-blue-600/60" />
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-gray-500">{rel.strength}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                        <p className="text-[10px] text-gray-400 leading-relaxed italic text-center">
                                            "수치가 높을수록 해당 후보 간의<br />지지층 교차 및 갈등 확률이 높습니다."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'simulation' && (
                        <motion.div key="sim" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto text-center py-20">
                            <Cpu size={64} className="text-blue-500 mx-auto mb-8 animate-pulse" />
                            <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter italic">Polisight AI Simulator</h3>
                            <p className="text-gray-500 mb-16 text-lg max-w-xl mx-auto">각종 정치적 변수(스캔들, 단일화, 이슈)가 발생했을 때의 지표 변화를 실시간으로 예측합니다.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="glass p-10 rounded-[2.5rem] border border-white/10">
                                    <h4 className="text-xs font-black text-gray-500 uppercase mb-8 tracking-[0.2em]">Shock Intensity (충격 강도)</h4>
                                    <div className="flex items-center gap-6">
                                        <input type="range" className="flex-1 accent-blue-600 h-2 bg-white/5 rounded-full appearance-none" />
                                        <span className="text-blue-500 font-mono font-bold text-xl">45%</span>
                                    </div>
                                </div>
                                <div className="glass p-10 rounded-[2.5rem] border border-white/10">
                                    <h4 className="text-xs font-black text-gray-500 uppercase mb-8 tracking-[0.2em]">Alliance Synergy (합병 효과)</h4>
                                    <div className="flex items-center gap-6">
                                        <input type="range" className="flex-1 accent-blue-600 h-2 bg-white/5 rounded-full appearance-none" />
                                        <span className="text-blue-500 font-mono font-bold text-xl">+12</span>
                                    </div>
                                </div>
                            </div>
                            <button className="mt-16 px-16 py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-black text-lg transition-all border-dashed">
                                시나리오 연산 엔진 가동
                            </button>
                        </motion.div>
                    )}

                    {activeTab === 'district' && (
                        <motion.div key="dist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[650px] glass rounded-[3rem] border border-white/5 flex items-center justify-center relative overflow-hidden bg-black/40">
                            <Globe size={400} className="text-blue-600 opacity-5 animate-spin-slow" />
                            <div className="text-center relative z-10">
                                <div className="w-20 h-20 bg-blue-600/20 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-blue-500/30">
                                    <Map size={40} className="text-blue-500" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 uppercase italic">Hyper-Local Map Interface</h3>
                                <p className="text-gray-500 max-w-md mx-auto">충청북도 11개 시군 및 읍면동 단위의 미세 지지 편향을 GIS 지도 상에서 실시간으로 시각화합니다.</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'expert' && (
                        <motion.div key="exp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
                            <div className="glass p-12 rounded-[3.5rem] border-l-8 border-blue-600 bg-gradient-to-r from-blue-900/10 to-transparent relative shadow-2xl">
                                <div className="absolute top-10 right-12 opacity-10">
                                    <Cpu size={120} />
                                </div>
                                <h3 className="text-2xl font-black mb-8 text-blue-400 italic">AI CHIEF STRATEGIST BRIEFING</h3>
                                <p className="text-2xl text-gray-200 leading-[1.6] font-light italic">
                                    "현재 시뮬레이션에 따르면 <strong className="text-white font-black underline decoration-blue-500 decoration-4 underline-offset-8 uppercase">{targetNames[0]} 후보</strong>의 지지 전이 확률이 골든크로스 임계점에 도달해 있습니다.
                                    상대적으로 <strong className="text-white font-black">{targetNames[1]} 후보</strong>의 조직 이탈 리스크가 북부권역에서 감지되므로, 해당 지역에 대한 정책 가시성을 20% 상향 조정할 것을 권고합니다."
                                </p>
                                <div className="mt-12 flex gap-4">
                                    <button className="px-8 py-3 bg-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30">PDF 리포트 다운로드</button>
                                    <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest">상세 데이터 로그 열람</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* --- STATUS FOOTER --- */}
            <footer className="relative z-50 border-t border-white/5 mt-32 py-12 px-12 flex flex-col items-center gap-8">
                <div className="flex gap-16 scale-90 md:scale-100">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-gray-600 mb-2 uppercase tracking-[0.3em]">AI Engine</p>
                        <p className="text-xs font-bold text-blue-500">POLISIGHT_X1_CORE</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-gray-600 mb-2 uppercase tracking-[0.3em]">Network Data</p>
                        <p className="text-xs font-bold text-blue-500">REALTIME_GRID_v5.4</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-gray-600 mb-2 uppercase tracking-[0.3em]">Service Status</p>
                        <p className="text-xs font-bold text-green-500">OPERATIONAL</p>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 w-full max-w-2xl text-center">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.5em] mb-2">POLISIGHT INTELLIGENCE TECHNOLOGY</p>
                    <p className="text-[10px] font-medium text-gray-600 italic">This platform is intended for high-level tactical campaign management only.</p>
                </div>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(59,130,246,0.2);
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 60s linear infinite;
                }
            `}</style>
        </div>
    );
}
