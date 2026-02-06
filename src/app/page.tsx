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

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen p-6 lg:p-10 space-y-8 bg-[#0a0a0b] text-white">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
                    >
                        2026 충북도지사 선거 전략 지휘 대시보드
                    </motion.h1>
                    <p className="text-gray-400 mt-2">실시간 다층 네트워크 및 시스템 다이내믹스 분석</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 rounded-full px-4 py-2 border border-white/10 items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">LIVE DATA FEED ADAPTIVE</span>
                    </div>
                    <button className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <Bell size={20} />
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "분석된 인맥 수", value: "842", icon: Users, color: "text-blue-400" },
                    { label: "여론 양극화 지수", value: "0.68", icon: Activity, color: "text-purple-400" },
                    { label: "평균 리스크 지수", value: "24.5%", icon: ShieldAlert, color: "text-red-400" },
                    { label: "예측 투표율", value: "62.4%", icon: TrendingUp, color: "text-green-400" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-2xl flex items-center justify-between"
                    >
                        <div>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
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
                                        <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="month" stroke="#999" fontSize={12} />
                                <YAxis stroke="#999" fontSize={12} unit="%" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="신용한" stroke="#0066CC" fillOpacity={1} fill="url(#colorShin)" strokeWidth={3} />
                                <Area type="monotone" dataKey="노영민" stroke="#3399FF" fillOpacity={0} strokeWidth={2} />
                                <Area type="monotone" dataKey="임호선" stroke="#66CCFF" fillOpacity={0} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
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
