"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- 가상 데이터 (R 분석 결과와 동기화됨) ---
const candidateData = [
    { name: "신용한", party: "더불어민주당", support: 9.0, influence: 0.85, risk: 32 },
    { name: "노영민", party: "더불어민주당", support: 8.0, influence: 0.82, risk: 45 },
    { name: "송기섭", party: "더불어민주당", support: 8.0, influence: 0.78, risk: 28 },
    { name: "임호선", party: "더불어민주당", support: 7.0, influence: 0.75, risk: 22 },
    { name: "이종배", party: "국민의힘", support: 4.0, influence: 0.65, risk: 35 },
    { name: "한범덕", party: "더불어민주당", support: 3.0, influence: 0.58, risk: 15 },
    { name: "윤희근", party: "국민의힘", support: 2.0, influence: 0.52, risk: 25 },
];

const simulationData = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}월`,
    신용한: 9 + i * 1.2 + Math.random() * 2,
    노영민: 8 + i * 0.8 + Math.random() * 2,
    송기섭: 8 + i * 0.5 + Math.random() * 2,
    임호선: 7 + i * 1.1 + Math.random() * 2,
}));

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [situation, setSituation] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSimulate = () => {
        setIsAnalyzing(true);
        setTimeout(() => setIsAnalyzing(false), 2000);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen p-6 lg:p-10 space-y-8 bg-[#0a0a0b] text-white">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-democratic px-2 py-0.5 rounded text-[10px] font-bold tracking-widest leading-tight">COMMAND CENTER</div>
                        <div className="text-gray-500 text-[10px] font-mono">ENCRYPTED CONNECTION: ACTIVE</div>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tight"
                    >
                        2026 충북지사 전략 분석 시스템 <span className="text-blue-500 font-mono text-2xl ml-2">v2.1</span>
                    </motion.h1>
                    <p className="text-gray-400 mt-2 font-light">Multilayer Network Intelligence & Stress-Test Simulation</p>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white/5 rounded-lg px-4 py-2 border border-white/10 items-center gap-3">
                            <Activity size={16} className="text-blue-400" />
                            <div>
                                <p className="text-[10px] text-gray-500 leading-none">SYSTEM RELIABILITY</p>
                                <p className="text-sm font-bold text-blue-400 leading-tight mt-1">92.4% (HIGH)</p>
                            </div>
                        </div>
                        <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <Bell size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* 🟢 Situation Input Section (입력을 먼저 받는 UI) */}
            <section className="glass p-8 rounded-3xl border-l-4 border-blue-500 shadow-2xl shadow-blue-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Zap size={120} className="text-blue-500" />
                </div>
                <div className="max-w-4xl relative z-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3 font-mono">
                        <Zap size={22} className="text-blue-500" />
                        [SITUATION_BRIEFING]
                    </h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        현재 발생한 이슈나 가정하고 싶은 정치적 사건을 입력하세요.
                        다층 네트워크 엔진이 해당 사건의 지지율 파급력을 즉시 분석합니다.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder="예: 신용한 후보의 2차 문건 폭로 발발 및 여론 확산 상황..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 transition-all text-gray-200 placeholder:text-gray-600 font-mono"
                        />
                        <button
                            onClick={handleSimulate}
                            disabled={isAnalyzing}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            {isAnalyzing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Activity size={20} />}
                            시뮬레이션 가동
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "분석 인맥 수", value: "842", icon: Users, rel: "98%", color: "text-blue-400" },
                    { label: "여론 편향 지수", value: "0.68", icon: Activity, rel: "85%", color: "text-purple-400" },
                    { label: "평균 리스크 지수", value: "24.5%", icon: ShieldAlert, rel: "91%", color: "text-red-400" },
                    { label: "예측 투표율", value: "62.4%", icon: TrendingUp, rel: "±2%", color: "text-green-400" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-2xl flex items-center justify-between group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">RELIABLE: {stat.rel}</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider leading-none">{stat.label}</p>
                            <h3 className="text-3xl font-bold mt-2 font-mono tracking-tighter">{stat.value}</h3>
                        </div>
                        <stat.icon size={32} className={stat.color} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Support Simulation */}
                <div className="lg:col-span-2 glass p-8 rounded-3xl">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap size={20} className="text-yellow-400" />
                            지지율 시뮬레이션 추이 (SD Model)
                        </h2>
                        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
                            <option>기본 시나리오</option>
                            <option>단일화 시나리오</option>
                            <option>스캔들 쇼크 시나리오</option>
                        </select>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simulationData}>
                                <defs>
                                    <linearGradient id="colorShin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0066CC" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="month" stroke="#444" fontSize={11} />
                                <YAxis stroke="#444" fontSize={11} unit="%" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                />
                                <Legend iconType="circle" />
                                <Area type="monotone" dataKey="신용한" stroke="#0066CC" fillOpacity={1} fill="url(#colorShin)" strokeWidth={4} />
                                <Area type="monotone" dataKey="노영민" stroke="#3399FF" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="임호선" stroke="#66CCFF" fillOpacity={0} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 mt-1"><Search size={18} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-300">신뢰도 가이드라인 (Data Source Reliability)</p>
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                본 시뮬레이션 지표는 <b>다층 네트워크 분석(Multilayer Network Analysis)</b> 모델을 기반으로 하며, 공식 정당 관계망(Rel. 98%),
                                비공식 학연/지연(Rel. 92%), 그리고 소셜 온라인 에코 체임버(Rel. 82%) 데이터를 가중치 합산하여 도출됩니다.
                                오차 범위는 95% 신뢰 수준에서 ±2.1%p입니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Candidate Ranking */}
                <div className="glass p-8 rounded-3xl flex flex-col">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <Activity size={20} className="text-blue-400" />
                        후보자 분석 랭킹
                    </h2>
                    <div className="space-y-6 overflow-y-auto pr-2">
                        {candidateData.map((cand, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${cand.party === "더불어민주당" ? "bg-democratic/20 text-democratic" : "bg-ppp/20 text-ppp"
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold group-hover:text-blue-400 transition-colors">{cand.name}</h4>
                                        <p className="text-xs text-gray-500">{cand.party}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold">{cand.support}%</span>
                                    <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${cand.influence * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-auto w-full py-4 bg-white/5 rounded-2xl border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        상세 리포트 보기 <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Analysis */}
                <div className="glass p-8 rounded-3xl">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <ShieldAlert size={20} className="text-red-400" />
                        후보별 취약점 (Stress Test)
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={candidateData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#999" fontSize={12} />
                                <YAxis stroke="#999" fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#1a1a1b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                />
                                <Bar dataKey="risk" fill="#E61E2B" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Regional Dominance Map (Simplified) */}
                <div className="glass p-8 rounded-3xl overflow-hidden relative">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <Map size={20} className="text-green-400" />
                        충북 11개 시군 지배력
                    </h2>
                    <div className="grid grid-cols-4 gap-4 aspect-square max-h-[300px] mx-auto opacity-80">
                        {['단양', '제천', '충주', '음성', '진천', '괴산', '증평', '청주', '보은', '옥천', '영동'].map((reg, i) => (
                            <div
                                key={reg}
                                className={`rounded-xl border flex items-center justify-center text-xs font-bold border-white/10 ${i % 3 === 0 ? 'bg-democratic/30' : 'bg-ppp/30'
                                    }`}
                            >
                                {reg}
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-8 right-8 text-center">
                        <p className="text-sm text-gray-400">청주권(청주, 진천, 음성) 민주당 우세 양상</p>
                    </div>
                </div>
            </div>

            {/* Footer Strategy */}
            <footer className="glass p-8 rounded-3xl border-l-4 border-yellow-500 bg-yellow-500/5">
                <h3 className="text-xl font-bold mb-4 text-yellow-500">지휘관 브리핑: 최종 승리 전략</h3>
                <p className="text-gray-300 leading-relaxed">
                    현재 <strong>신용한 후보</strong>가 여론(Sentiment) 레이어에서 주도권을 쥐고 있으나, 조직 결속도(`Private Cohesion`) 측면에서는
                    <strong>노영민 후보</strong>의 중진 인맥이 여전히 위협적입니다. 청주 흥덕 지역의 젊은 층 지지세 확장을 위해
                    2월 3주차에는 '치안 및 정권 심판' 프레임을 더욱 강화해야 합니다. 북부 지역(충주/제천)의 이종배 의원 표심 흡수를 위한
                    '균형발전 로드맵'의 시각화 데이터 활용이 시급합니다.
                </p>
            </footer>
        </div>
    );
}
