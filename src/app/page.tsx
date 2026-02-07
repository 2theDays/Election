"use client";

import React, { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- 가상 데이터 및 후보별 특성 매핑 ---
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

const getSimulationData = (names: string[]) => {
    return Array.from({ length: 12 }, (_, i) => {
        const row: any = { month: `${i + 1}월` };
        names.forEach(name => {
            row[name] = (getCandidateStats(name).support) + i * (Math.random() * 1.5) + (Math.random() * 2);
        });
        row["평균"] = 7 + Math.random() * i;
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

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
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
        }, 1800);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen p-6 lg:p-10 space-y-8 bg-[#0a0a0b] text-white">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-democratic px-2 py-0.5 rounded text-[10px] font-bold tracking-widest leading-tight uppercase">COMMAND CENTER</div>
                        <div className="text-gray-500 text-[10px] font-mono whitespace-nowrap">ENCRYPTED CONNECTION: ACTIVE</div>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tight"
                    >
                        2026 충북지사 전략 분석 시스템 <span className="text-blue-500 font-mono text-2xl ml-2">v2.1</span>
                    </motion.h1>
                    <p className="text-gray-400 mt-2 font-light">Multilayer Network Intelligence & Dynamic Alliance Analysis</p>
                </div>

                <div className="flex bg-white/5 rounded-lg px-4 py-2 border border-white/10 items-center gap-3">
                    <Activity size={16} className="text-blue-400" />
                    <div>
                        <p className="text-[10px] text-gray-500 leading-none">SYSTEM RELIABILITY</p>
                        <p className="text-sm font-bold text-blue-400 leading-tight mt-1">92.4% (HIGH)</p>
                    </div>
                </div>
            </header>

            {/* Input Section */}
            <section className="glass p-8 rounded-3xl border-l-4 border-blue-500 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
                <div className="max-w-4xl relative z-10">
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                        <Users size={28} className="text-blue-500" />
                        다중 후보자 비교 및 관계 분석
                    </h2>
                    <p className="text-gray-400 mb-8 text-base">
                        분석할 후보자들을 쉼표(,)로 구분하여 입력하십시오. 역학 관계와 상대적 지지율을 즉시 산출합니다.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="여러 후보 입력 (예: 신용한, 노영민, 이종배...)"
                                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-12 py-5 outline-none focus:border-blue-500 transition-all text-xl font-bold"
                                onKeyPress={(e) => e.key === 'Enter' && handleRunAnalysis()}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
                        </div>
                        <button
                            onClick={handleRunAnalysis}
                            disabled={isAnalyzing}
                            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 border-b-4 border-blue-800"
                        >
                            {isAnalyzing ? "연산 중..." : "통합 분석 실행"}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {targetNames.map((name, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold font-mono">
                                #{name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {multiStats.map((stat, idx) => (
                    <motion.div
                        key={stat.name + idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-2xl font-black tracking-tight">{stat.name}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{stat.party}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-blue-400 font-mono">{stat.support}%</span>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">SUPPORT</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[10px] mb-1 font-bold text-gray-400">
                                    <span>INFLUENCE</span>
                                    <span>{stat.influence}</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${stat.influence * 100}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] mb-1 font-bold text-gray-400">
                                    <span>RISK</span>
                                    <span className="text-red-400">{stat.risk}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${stat.risk}%` }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5 h-[500px]">
                    <h2 className="text-2xl font-black mb-10 flex items-center gap-3">
                        <TrendingUp size={26} className="text-blue-400" />
                        다중 후보 지지율 추적 시뮬레이션
                    </h2>
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={simData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                            <XAxis dataKey="month" stroke="#333" fontSize={11} />
                            <YAxis stroke="#333" fontSize={11} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                            <Legend />
                            {targetNames.map((name, i) => (
                                <Line
                                    key={name}
                                    type="monotone"
                                    dataKey={name}
                                    stroke={["#0066CC", "#3399FF", "#66CCFF", "#99CCFF", "#CCCCFF"][i % 5]}
                                    strokeWidth={4}
                                    dot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass p-8 rounded-3xl flex flex-col border border-white/5 h-[500px]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Zap size={24} className="text-yellow-500" />
                        상호 영향력 매트릭스
                    </h2>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        {relMatrix.map((rel, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-blue-500/50 transition-all">
                                <div className="flex justify-between items-center mb-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400 font-bold">{rel.from}</span>
                                        <ChevronRight size={10} className="text-gray-600" />
                                        <span className="text-gray-300 font-bold">{rel.to}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${rel.type === "경쟁" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                                        {rel.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500/50" style={{ width: `${rel.strength}%` }} />
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-500">{rel.strength}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-6 italic">
                        * 영향력 점수는 다층 네트워크의 Edge Density를 기반으로 산출됩니다.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl border border-white/5">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Map size={24} className="text-green-400" />
                        지휘관 브리핑
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {targetNames.join(", ")} 후보들 간의 역학 관계 분석 결과,
                        현재 {targetNames[0]} 후보가 주도권을 쥐고 있으나 {targetNames[1]} 후보와의 경쟁 강도가 매우 높습니다.
                        지역구별 조직 이탈 리스크를 상시 모니터링하십시오.
                    </p>
                </div>
                <div className="glass p-8 rounded-3xl border border-white/5 bg-blue-500/5">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Settings className="text-blue-500" />
                        작전 지침
                    </h2>
                    <div className="space-y-2 text-xs text-gray-500">
                        <li>1. 입력창에 여러 후보의 이름을 쉼표로 구분하여 넣으십시오.</li>
                        <li>2. 분석 실행 버튼을 누르면 실시간 시뮬레이션이 가동됩니다.</li>
                        <li>3. 오른쪽 매트릭스에서 후보 간의 경쟁/동맹 강도를 확인하십시오.</li>
                    </div>
                </div>
            </footer>
        </div>
    );
}
