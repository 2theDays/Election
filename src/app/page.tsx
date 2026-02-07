"use client";

import React, { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Target, Layers, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 가상 데이터 및 엔진 로직 ---
const getCandidateStats = (name: string) => {
    const baseStats: Record<string, any> = {
        "신용한": { party: "더불어민주당", support: 9.4, influence: 0.88, risk: 28, winProb: 64 },
        "노영민": { party: "더불어민주당", support: 8.2, influence: 0.82, risk: 42, winProb: 42 },
        "송기섭": { party: "더불어민주당", support: 8.0, influence: 0.76, risk: 31, winProb: 38 },
        "이종배": { party: "국민의힘", support: 4.2, influence: 0.61, risk: 38, winProb: 15 },
    };
    return baseStats[name] || { party: "기타", support: 5, influence: 0.5, risk: 20, winProb: 10 };
};

const getSimulationData = (names: string[]) => {
    return Array.from({ length: 12 }, (_, i) => {
        const row: any = { month: `${i + 1}월` };
        names.forEach(name => {
            row[name] = (getCandidateStats(name).support) + i * (Math.random() * 1.5);
        });
        return row;
    });
};

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [inputText, setInputText] = useState("신용한, 노영민");
    const [targetNames, setTargetNames] = useState(["신용한", "노영민"]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Stats & Data
    const [multiStats, setMultiStats] = useState(targetNames.map(n => ({ name: n, ...getCandidateStats(n) })));
    const [simData, setSimData] = useState(getSimulationData(targetNames));

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
            setIsAnalyzing(false);
        }, 1200);
    };

    if (!mounted) return null;

    const tabs = [
        { id: 'general', label: '통합 전황', icon: TrendingUp },
        { id: 'predict', label: '당선 예측', icon: Target },
        { id: 'geo', label: '지역/지능', icon: Globe },
        { id: 'risk', label: '위기 시뮬', icon: ShieldAlert },
    ];

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-[#0a0a0b] text-white font-sans selection:bg-blue-500/30">
            {/* --- TOP HEADER --- */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest animate-pulse">LIVE ANALYTICS</span>
                        <span className="text-gray-600 text-[10px] font-mono border border-white/10 px-2 py-1 rounded italic">SRV-CNX: SECURED</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        2026 충북지사 전략 지휘소 <span className="text-blue-500 font-mono text-xl ml-2 opacity-50">PRO v3.0</span>
                    </h1>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <nav className="flex p-1 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 w-full md:w-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            {/* --- CORE INPUT SECTION --- */}
            <div className="glass p-6 rounded-3xl border border-white/10 mb-8 bg-gradient-to-r from-blue-900/5 to-transparent relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="분석 후보자 입력 (예: 신용한, 노영민, 이종배...)"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-14 py-5 outline-none focus:border-blue-500 transition-all text-lg font-bold placeholder:text-gray-700"
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-500 transition-colors" size={24} />
                    </div>
                    <button
                        onClick={handleRunAnalysis}
                        disabled={isAnalyzing}
                        className="w-full md:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/40 border-b-4 border-blue-900 active:translate-y-1 active:border-b-0"
                    >
                        {isAnalyzing ? (
                            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Zap size={22} className="text-yellow-400 fill-yellow-400" />
                                <span>작전 분석 실행</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* --- DYNAMIC CONTENT BASED ON TABS --- */}
            <main className="space-y-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'general' && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-8"
                        >
                            {/* Candidate Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {multiStats.map((stat, idx) => (
                                    <div key={idx} className="glass p-6 rounded-2xl border border-white/5 relative group hover:border-blue-500/30 transition-all overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tighter">{stat.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.party}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black font-mono text-blue-400">{stat.support}%</div>
                                                <div className="text-[8px] text-gray-600 uppercase">Current Support</div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-[10px] mb-1 font-bold">
                                                    <span className="text-gray-500">RELATIONSHIP INDEX</span>
                                                    <span className="text-blue-500">{stat.influence}</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stat.influence * 100}%` }} className="h-full bg-blue-500" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 text-[10px] pt-4 border-t border-white/5">
                                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">WIN PROB: {stat.winProb}%</span>
                                                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20">RISK: {stat.risk}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10 h-[500px] relative">
                                    <div className="absolute top-8 right-8 flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Weighted Avg</span>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-black mb-10 flex items-center gap-3">
                                        <TrendingUp className="text-blue-500" />
                                        통합 지지율 변동 추이 (Golden-Cross Tracking)
                                    </h2>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <AreaChart data={simData}>
                                            <defs>
                                                {targetNames.map((n, i) => (
                                                    <linearGradient key={i} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={["#0066CC", "#3399FF", "#66CCFF", "#99CCFF"][i % 4]} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={["#0066CC", "#3399FF", "#66CCFF", "#99CCFF"][i % 4]} stopOpacity={0} />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="month" stroke="#333" fontSize={11} />
                                            <YAxis stroke="#333" fontSize={11} unit="%" />
                                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #white/10', borderRadius: '16px' }} />
                                            <Legend />
                                            {targetNames.map((name, i) => (
                                                <Area
                                                    key={name}
                                                    type="monotone"
                                                    dataKey={name}
                                                    stroke={["#0066CC", "#3399FF", "#66CCFF", "#99CCFF"][i % 4]}
                                                    fill={`url(#color${i})`}
                                                    strokeWidth={4}
                                                />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                                    <Activity className="text-blue-500 mb-6" size={48} />
                                    <h3 className="text-2xl font-black mb-4">현재 시장 강도 (Momentum)</h3>
                                    <div className="text-6xl font-black text-blue-500 mb-4 tracking-tighter">Rising</div>
                                    <p className="text-gray-500 text-sm leading-relaxed px-6">
                                        충북 전역의 여론 조사 통합 결과, 후보군 간의 격차가 좁혀지는 **변동성 극대화** 구간에 진입했습니다.
                                        특히 청주권역의 3040 세대 지지 전이가 가속화되고 있습니다.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'predict' && (
                        <motion.div
                            key="predict"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <div className="glass p-10 rounded-3xl border border-white/10 text-center">
                                <h2 className="text-xl font-bold mb-10 text-gray-400">몬테카를로 시뮬레이션 기반 당선 확률</h2>
                                <div className="relative inline-block">
                                    <svg className="w-64 h-64 -rotate-90">
                                        <circle cx="128" cy="128" r="110" fill="none" stroke="#ffffff05" strokeWidth="20" />
                                        <circle cx="128" cy="128" r="110" fill="none" stroke="#0066CC" strokeWidth="20" strokeDasharray="691" strokeDashoffset={691 - (691 * multiStats[0].winProb / 100)} className="transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="text-6xl font-black font-mono">{multiStats[0].winProb}%</div>
                                        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-2">{multiStats[0].name} 당선 예상</div>
                                    </div>
                                </div>
                            </div>
                            <div className="glass p-10 rounded-3xl border border-white/10">
                                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                    <Target className="text-red-500" />
                                    격차 시뮬레이션 (Margin of Victory)
                                </h2>
                                <div className="space-y-8">
                                    {multiStats.map((stat, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold">{stat.name}</span>
                                                <span className="text-blue-400 font-mono text-xs">확률분포 최상단: {stat.support + 4}%</span>
                                            </div>
                                            <div className="h-4 bg-white/5 rounded-full overflow-hidden flex">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${stat.winProb}%` }} className="h-full bg-blue-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                    <p className="text-[11px] text-gray-500 leading-relaxed italic">
                                        * 본 확률은 단순 지지율이 아닌, 과거 충북 선거의 지역별 투표 편향성과 세대별 투표율을 가중치로 적용한 **10,000번의 반복 연산** 결과입니다.
                                        오차범위 밖 유의미한 수치입니다.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'geo' && (
                        <motion.div
                            key="geo"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            <div className="lg:col-span-2 glass p-10 rounded-3xl border border-white/10 h-[600px] flex flex-col">
                                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                    <Globe className="text-green-500" />
                                    하이퍼-로컬 지지 지형도 (District Dominance)
                                </h2>
                                <div className="bg-black/20 flex-1 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                    {/* Simple Dynamic Map Placeholder */}
                                    {['청주', '충주', '제천', '음성', '진천', '괴산', '증평', '보은', '옥천', '영동', '단양'].map((city, i) => (
                                        <div key={city}
                                            className={`absolute p-4 border rounded-xl font-bold transition-all hover:scale-110 cursor-pointer ${i % 3 === 0 ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800/20 border-white/10 text-gray-600'}`}
                                            style={{
                                                top: `${20 + (i % 4) * 15}%`,
                                                left: `${15 + (i % 3) * 25}%`
                                            }}
                                        >
                                            {city}
                                        </div>
                                    ))}
                                    <div className="absolute bottom-8 left-8 p-4 glass bg-black/60 border border-white/10 rounded-xl max-w-xs">
                                        <p className="text-xs font-bold text-blue-400 mb-2">● 청주권역 전략 보고</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed">
                                            청주시 흥덕구 및 청원구를 중심으로 **2.4%p의 전력 상승**이 포착되었습니다.
                                            이 지역의 무당층이 민주당 심판 프레임보다 정책 중심의 투표 성향으로 이동 중입니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col">
                                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                    <Layers className="text-purple-500" />
                                    다층 조직 지침
                                </h2>
                                <div className="space-y-6">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <h4 className="text-sm font-bold text-gray-300 mb-2">1단계: 기반공고화</h4>
                                        <p className="text-xs text-gray-500">각 후보자별 핵심 연고지(출신 학교/지역)의 지지세를 90% 이상 결집하십시오.</p>
                                    </div>
                                    <div className="p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                                        <h4 className="text-sm font-bold text-blue-400 mb-2">2단계: 외연 확장</h4>
                                        <p className="text-xs text-gray-500">SNS 상의 에코체임버를 넘어 네이버/다음 카페 등 중도층 접점으로 프레임을 전이하십시오.</p>
                                    </div>
                                    <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold mt-10">
                                        상세 네트워크 분석 PDF 열기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* --- DEPLOYMENT FOOTER --- */}
            <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-600 text-[10px] font-mono gap-4">
                <div className="flex gap-8">
                    <span>STATUS: ALL ENGINES OPERATIONAL</span>
                    <span>LATENCY: 42ms</span>
                    <span>LAST SYNC: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="text-right">
                    COPYRIGHT &copy; 2026 ELECTION COMMAND CENTER. ALL STRATEGIES CLASSIFIED.
                </div>
            </footer>
        </div>
    );
}
