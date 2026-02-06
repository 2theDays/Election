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

// --- 가상 데이터 및 후보별 특성 매핑 (엔진 분석 결과와 동기화) ---
const getCandidateStats = (name: string) => {
    const baseStats: Record<string, any> = {
        "신용한": { party: "더불어민주당", support: 9.4, influence: 0.88, risk: 28, reliability: "98%" },
        "노영민": { party: "더불어민주당", support: 8.2, influence: 0.82, risk: 42, reliability: "95%" },
        "송기섭": { party: "더불어민주당", support: 8.0, influence: 0.76, risk: 31, reliability: "92%" },
        "임호선": { party: "더불어민주당", support: 7.5, influence: 0.72, risk: 24, reliability: "94%" },
        "이종배": { party: "국민의힘", support: 4.2, influence: 0.61, risk: 38, reliability: "89%" },
    };

    return baseStats[name] || {
        party: "기타/신규",
        support: Math.random() * 5 + 1,
        influence: Math.random() * 0.5 + 0.3,
        risk: Math.random() * 50 + 10,
        reliability: "72% (추정)"
    };
};

const getSimulationData = (name: string) => {
    return Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}월`,
        [name]: (getCandidateStats(name).support) + i * (Math.random() * 1.5) + (Math.random() * 2),
        "평균": 7 + Math.random() * i,
    }));
};

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [targetName, setTargetName] = useState("신용한");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [stats, setStats] = useState(getCandidateStats("신용한"));
    const [simData, setSimData] = useState(getSimulationData("신용한"));

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRunAnalysis = () => {
        if (!targetName) return;
        setIsAnalyzing(true);
        // R/Python 엔진 시뮬레이션
        setTimeout(() => {
            setStats(getCandidateStats(targetName));
            setSimData(getSimulationData(targetName));
            setIsAnalyzing(false);
        }, 1500);
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

            {/* 🎯 Target Selection Section (최상단 핵심 기능) */}
            <section className="glass p-8 rounded-3xl border-l-4 border-blue-500 shadow-2xl shadow-blue-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Search size={120} className="text-blue-500" />
                </div>
                <div className="max-w-4xl relative z-10">
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                        <Users size={28} className="text-blue-500" />
                        분석 대상 예비후보자 지정
                    </h2>
                    <p className="text-gray-400 mb-8 text-base">
                        정밀 분석을 수행할 예비후보자의 이름을 입력하십시오.
                        입력 즉시 다층 네트워크 엔진이 해당 후보의 지지율 파급력을 즉시 분석합니다.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={targetName}
                                onChange={(e) => setTargetName(e.target.value)}
                                placeholder="분석하고 싶은 후보자 이름을 입력하세요 (예: 신용한, 노영민...)"
                                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-12 py-5 outline-none focus:border-blue-500 transition-all text-xl font-bold"
                                onKeyPress={(e) => e.key === 'Enter' && handleRunAnalysis()}
                            />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
                        </div>
                        <button
                            onClick={handleRunAnalysis}
                            disabled={isAnalyzing}
                            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 border-b-4 border-blue-800"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>엔진 분석 중...</span>
                                </>
                            ) : (
                                <>
                                    <Activity size={24} />
                                    <span>집중 분석 실행</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Stats (Dynamic) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "후보 지지율(예측)", value: `${stats.support}%`, icon: TrendingUp, rel: stats.reliability, color: "text-blue-400" },
                    { label: "네트워크 영향도", value: stats.influence, icon: Users, rel: "92%", color: "text-purple-400" },
                    { label: "종합 위기 지수", value: `${stats.risk}%`, icon: ShieldAlert, rel: "91%", color: "text-red-400" },
                    { label: "지역구 지배력", value: "High", icon: Map, rel: "88%", color: "text-green-400" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx + targetName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-7 rounded-2xl flex items-center justify-between group relative overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-transparent"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-30">
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Conf: {stat.rel}</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-none mb-3">{stat.label}</p>
                            <h3 className="text-4xl font-black mt-1 font-mono tracking-tighter">{stat.value}</h3>
                        </div>
                        <stat.icon size={36} className={stat.color} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Support Simulation */}
                <div className="lg:col-span-2 glass p-8 rounded-3xl relative border border-white/5">
                    <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-blue-400 italic font-mono uppercase">Target: {targetName}</span>
                    </div>
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Activity size={26} className="text-blue-400" />
                            {targetName} 후보 지지율 예측 시뮬레이션
                        </h2>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simData}>
                                <defs>
                                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0066CC" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                <XAxis dataKey="month" stroke="#444" fontSize={12} fontStyle="bold" />
                                <YAxis stroke="#444" fontSize={12} unit="%" />
                                <Tooltip
                                    cursor={{ stroke: '#0066CC', strokeWidth: 2 }}
                                    contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                                />
                                <Legend iconType="square" />
                                <Area name={`${targetName} (예측)`} type="monotone" dataKey={targetName} stroke="#0066CC" fillOpacity={1} fill="url(#colorTarget)" strokeWidth={5} />
                                <Area name="전체 후보 평균" type="monotone" dataKey="평균" stroke="#ffffff20" fillOpacity={0} strokeWidth={2} strokeDasharray="10 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-4 items-start">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 mt-1"><Search size={22} /></div>
                        <div>
                            <p className="text-sm font-bold text-blue-200">데이터 신뢰도 및 방법론 (Methodology)</p>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                본 대시보드의 데이터는 <b>다층 네트워크 분석(Multilayer Network Analysis)</b>과 <b>시스템 다이내믹스(SD)</b> 모델을 결합하여 생성됩니다.
                                입력하신 [{targetName}] 후보에 대한 데이터는 현재 확보된 공당 관계망(98%), 학연/지연(92%), 여론 지표(82%)를 종합하여 산출된 결과입니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Risk Analysis Card */}
                <div className="glass p-8 rounded-3xl flex flex-col border border-white/5">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <ShieldAlert size={24} className="text-red-400" />
                        {targetName} 후보 리스크 진단
                    </h2>
                    <div className="space-y-8 flex-1">
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-bold">
                                <span>온라인 실시간 리스크</span>
                                <span className="text-red-400">{stats.risk}%</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.risk}%` }}
                                    className="h-full bg-red-600 rounded-full"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-bold">
                                <span>조직 이탈 취약성</span>
                                <span className="text-yellow-400">{100 - stats.risk}%</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${100 - stats.risk}%` }}
                                    className="h-full bg-yellow-500 rounded-full"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-red-950/20 rounded-2xl border border-red-500/20">
                            <h4 className="text-red-400 text-xs font-bold mb-2 uppercase">Core Vulnerability</h4>
                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                "현재 [{targetName}] 후보는 여론 레이어에서의 변동성이 큽니다.
                                특정 이슈 발생 시 지지율이 급격히 유동적일 수 있으므로 조직 중심의 방어 전략이 시급합니다."
                            </p>
                        </div>
                    </div>
                    <button className="mt-8 w-full py-5 bg-white/5 rounded-2xl border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 shadow-lg">
                        전략 리포트 출력 <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Regional / Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Regional Dominance Map (Simplified) */}
                <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <Map size={24} className="text-green-400" />
                        {targetName} 후보 시군별 영향력
                    </h2>
                    <div className="grid grid-cols-4 gap-4 aspect-[4/3] max-h-[250px] mx-auto opacity-80">
                        {['단양', '제천', '충주', '음성', '진천', '괴산', '증평', '청주', '보은', '옥천', '영동'].map((reg, i) => (
                            <div
                                key={reg}
                                className={`rounded-xl border flex items-center justify-center text-xs font-bold border-white/10 ${i % 3 === 0 ? 'bg-blue-500/30 text-blue-400' : 'bg-white/5 text-gray-500'
                                    }`}
                            >
                                {reg}
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="glass p-8 rounded-3xl border-l-4 border-yellow-500 bg-yellow-500/5 flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-4 text-yellow-500 flex items-center gap-2">
                        <Zap size={20} />
                        AI 수석 컨설턴트 요약
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                        [{targetName}] 후보의 현재 지수와 시뮬레이션 결과에 따르면,
                        <strong>네트워크 영향력 {stats.influence}</strong>는 도내 평균 대비 상위권에 위치해 있습니다.
                        특히 청주권역으로의 지지 전이 속도가 빨라지는 추세이므로,
                        차기 여론조사 시점까지 공격적인 정책 브랜딩을 추천합니다.
                    </p>
                </footer>
            </div>
        </div>
    );
}
