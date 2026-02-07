"use client";

import React, { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Cpu, BookOpen, BarChart3, LayoutDashboard, User, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 전용 가상 데이터 엔진 ---
const getCandidateStats = (name: string) => {
    const baseStats: Record<string, any> = {
        "신용한": { party: "더불어민주당", support: 9.6, influence: 0.92, risk: 18, winProb: 68 },
        "노영민": { party: "더불어민주당", support: 8.4, influence: 0.85, risk: 38, winProb: 45 },
        "송기섭": { party: "더불어민주당", support: 7.8, influence: 0.72, risk: 24, winProb: 32 },
        "이종배": { party: "국민의힘", support: 4.5, influence: 0.65, risk: 32, winProb: 18 },
    };
    return baseStats[name] || { party: "기타", support: 5.0, influence: 0.50, risk: 20, winProb: 10 };
};

const getSimulationData = (names: string[]) => {
    return Array.from({ length: 12 }, (_, i) => {
        const row: any = { month: `${i + 1}월` };
        names.forEach(name => {
            row[name] = (getCandidateStats(name).support) + i * (Math.random() * 1.8);
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

export default function VotelabDashboard() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('basecamp');
    const [inputText, setInputText] = useState("신용한, 노영민");
    const [targetNames, setTargetNames] = useState(["신용한", "노영민"]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Stats & Data
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
        }, 1500);
    };

    if (!mounted) return null;

    const navItems = [
        { id: 'basecamp', label: '선거 베이스캠프', icon: LayoutDashboard },
        { id: 'simulation', label: '선거 시뮬레이션', icon: Cpu },
        { id: 'district', label: '선거구 정밀분석', icon: Map },
        { id: 'expert', label: 'EXPERT 전략', icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans overflow-x-hidden">
            {/* --- DATA WAVE BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,204,0.1),transparent_70%)]" />
                <svg className="absolute w-full h-full" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" stroke="rgba(0,102,204,0.1)" strokeWidth="1" d="M0,400 Q360,300 720,400 T1440,400" className="animate-pulse" />
                </svg>
            </div>

            {/* --- TOP NAV BAR --- */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl px-4 lg:px-12 py-4 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic">V</div>
                        <span className="text-xl font-black tracking-tighter">VOTE <span className="text-blue-500">LAB</span></span>
                    </div>
                    <div className="hidden lg:flex items-center gap-8">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`text-xs font-bold tracking-widest transition-all ${activeTab === item.id ? 'text-blue-500 underline underline-offset-8' : 'text-gray-500 hover:text-white'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white"><Bell size={20} /></button>
                    <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-blue-400">
                        <User size={20} />
                    </button>
                </div>
            </nav>

            <main className="relative z-10 p-4 lg:p-12 max-w-[1600px] mx-auto">
                <header className="mb-12 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                        <span className="text-blue-500 text-xs font-black tracking-[0.3em] uppercase">Data · Strategy · Victory</span>
                    </motion.div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">데이터가 만드는 차이, 전략이 만드는 승리</h2>
                    <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed italic">
                        보트랩은 후보와 캠프 전략 참모가 상황을 감이 아닌 데이터로 정확하게 읽고 판단할 수 있도록 돕습니다.
                    </p>
                </header>

                {/* SEARCH */}
                <div className="max-w-4xl mx-auto mb-20">
                    <div className="relative group">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="분석할 후보 또는 정당명을 검색하세요"
                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-16 py-7 text-xl font-bold outline-none focus:border-blue-500/50 transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && handleRunAnalysis()}
                        />
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500" size={28} />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'basecamp' && (
                        <motion.div key="base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {multiStats.map((stat, i) => (
                                    <div key={i} className="glass p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h4 className="text-3xl font-black tracking-tighter">{stat.name}</h4>
                                                <p className="text-[10px] font-black text-gray-500 uppercase mt-1">{stat.party}</p>
                                            </div>
                                            <Activity size={24} className="text-blue-500" />
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[10px] text-gray-600 font-bold mb-1">PROBABILITY</p>
                                                <h5 className="text-4xl font-mono font-black">{stat.winProb}%</h5>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-600 font-bold mb-1">RISK</p>
                                                <h5 className="text-xl font-mono font-bold text-red-500">{stat.risk}%</h5>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 glass p-10 rounded-[2.5rem] border border-white/5 h-[500px]">
                                    <h3 className="text-xl font-black mb-10 flex items-center gap-3"><TrendingUp className="text-blue-500" /> 통합 지지율 추세</h3>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <AreaChart data={simData}>
                                            <defs>
                                                {targetNames.map((_, i) => (
                                                    <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                            <XAxis dataKey="month" stroke="#333" fontSize={11} />
                                            <YAxis stroke="#333" fontSize={11} unit="%" />
                                            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222' }} />
                                            {targetNames.map((name, i) => (
                                                <Area key={i} type="monotone" dataKey={name} stroke="#3b82f6" fill={`url(#grad${i})`} strokeWidth={4} />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="glass p-10 rounded-[2.5rem] border border-white/5">
                                    <h3 className="text-xl font-black mb-8 flex items-center gap-3"><ShieldAlert className="text-red-500" /> 상호 경쟁 분석</h3>
                                    <div className="space-y-6">
                                        {relMatrix.map((rel, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <div className="flex justify-between text-[10px] font-bold mb-3">
                                                    <span>{rel.from} → {rel.to}</span>
                                                    <span className={rel.type === '경쟁' ? 'text-red-400' : 'text-green-400'}>{rel.type}</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500/50" style={{ width: `${rel.strength}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'simulation' && (
                        <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto text-center py-20">
                            <Cpu size={64} className="text-blue-500 mx-auto mb-8" />
                            <h3 className="text-3xl font-black mb-4">선거 시나리오 엔진</h3>
                            <p className="text-gray-500 mb-12">각종 변수를 조정하여 최악의 시나리오와 최선의 경로를 예측하십시오.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="glass p-8 rounded-3xl border border-white/5">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-6">스캔들 충격 시뮬레이션</h4>
                                    <input type="range" className="w-full accent-blue-600" />
                                </div>
                                <div className="glass p-8 rounded-3xl border border-white/5">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-6">부동층 흡수율 시뮬레이션</h4>
                                    <input type="range" className="w-full accent-blue-600" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'district' && (
                        <motion.div key="dist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[600px] glass rounded-[3rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
                            <Globe size={300} className="text-blue-500 opacity-10 animate-spin-slow" />
                            <div className="absolute inset-0 flex items-center justify-center font-black text-4xl tracking-tighter text-white/20 uppercase italic">
                                Hyper-Local GIS Map Interface
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'expert' && (
                        <motion.div key="exp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                            <div className="glass p-12 rounded-[3rem] border-l-8 border-blue-600 bg-gradient-to-r from-blue-900/10 to-transparent">
                                <h3 className="text-2xl font-black mb-6 text-blue-400">AI 수석 전략가 브리핑</h3>
                                <p className="text-lg text-gray-300 leading-relaxed font-light italic">
                                    "현재 지표상 <strong className="text-white font-black underline decoration-blue-500">{targetNames[0]} 후보</strong>의 네트워크 결속력이 매우 높게 나타납니다.
                                    상대 후보의 지연/학연 기반 조직력 틈새를 공략하는 '청주권 독자 행보'가 유효한 시점입니다."
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="border-t border-white/5 mt-20 py-10 px-12 text-center">
                <p className="text-[10px] font-bold text-gray-600 tracking-[0.4em] uppercase">Votelab Intelligence Systems &copy; 2026</p>
            </footer>
        </div>
    );
}
