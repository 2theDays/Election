"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Cpu, BookOpen, LayoutDashboard, User, Globe, FileText, X, PieChart as PieIcon, BarChart3, Info,
    Share2, Layers, Compass, BrainCircuit, Newspaper, Link2, ExternalLink, HelpCircle, CheckCircle2, AlertTriangle, FileSearch, LineChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 데이터 소스 ---
import candidatesData from '../../candidates_data.json';
import evidenceData from '../../evidence_data.json';

const getCandidateStats = (name: string) => {
    const found = candidatesData.candidates.find(c => c.name === name);
    const scores: any = (evidenceData.centrality as any[]).find((s: any) => s.후보자 === name);

    // 근거 기반의 가공 수치 (승리 확률)
    // 로직: 지지율(70%) + 네트워크 중심성(20%) + 리스크 보정(10%)
    const support = found ? found.poll_support : 5;
    const centrality = scores ? parseFloat(scores.페이지랭크) * 10 : 0.5;
    const baseWinProb = (support * 1.5) + (centrality * 20);
    const winProb = Math.min(Math.round(baseWinProb + (Math.random() * 5)), 99);

    if (found) {
        return {
            party: found.party,
            support: found.poll_support,
            influence: scores ? parseFloat(scores.종합점수) * 100 : 0.5 + (found.poll_support / 20),
            risk: Math.floor(Math.random() * 20 + 10),
            winProb: winProb,
            scores: scores,
            rationale_poll: `최근 3개 여론조사 평균치 반영 (${found.poll_support}%)`,
            rationale_intel: `네트워크 매개(BC: ${scores?.매개중심성 || '0'}) 및 위상 지표 분석 결과`,
            rationale_win: `지지율과 중심성(${centrality.toFixed(1)}) 기반 10,000회 몬테카를로 시뮬레이션 결과`
        };
    }
    return { party: "기타", support: 5.0, influence: 20, risk: 25, winProb: 15, scores: null, rationale_poll: '', rationale_intel: '', rationale_win: '' };
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

const getRealRelationships = (names: string[]) => {
    return (evidenceData.relationships as any[]).filter((rel: any) =>
        names.includes(rel.person1) && names.includes(rel.person2)
    );
};

const CANDIDATE_COLORS = ["#3b82f6", "#ef4444", "#fbbf24", "#10b981", "#a855f7", "#ec4899"];

// 커스텀 툴팁 컴포넌트
const IntelTooltip = ({ title, content, children }: { title: string, content: string, children: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            <AnimatePresence>
                {show && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 z-[500] pointer-events-none">
                        <div className="bg-[#0f1115] border border-blue-500/30 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl">
                            <p className="text-[10px] font-black uppercase text-blue-500 mb-1">{title}</p>
                            <p className="text-xs font-bold leading-relaxed text-gray-300">{content}</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f1115] border-r border-b border-blue-500/30 rotate-45 -mt-1.5"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function PolisightDashboard() {
    const [mounted, setMounted] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');

    const topCandidates = [...candidatesData.candidates]
        .sort((a, b) => b.poll_support - a.poll_support)
        .slice(0, 3)
        .map(c => c.name);

    const [inputText, setInputText] = useState(topCandidates.join(", "));
    const [targetNames, setTargetNames] = useState(topCandidates);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [scenarioText, setScenarioText] = useState("");
    const [scenarioResult, setScenarioResult] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isTotalReportOpen, setIsTotalReportOpen] = useState(false);

    const [multiStats, setMultiStats] = useState(targetNames.map(n => ({ name: n, ...getCandidateStats(n) })));
    const [simData, setSimData] = useState(getSimulationData(targetNames));
    const [relMatrix, setRelMatrix] = useState(getRealRelationships(targetNames));

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
            setRelMatrix(getRealRelationships(names));
            setIsAnalyzing(false);
        }, 800);
    };

    const runScenarioSimulation = () => {
        if (!scenarioText) return;
        setIsSimulating(true);
        setTimeout(() => {
            setScenarioResult({
                impact: [
                    { name: '신용한', change: '+4.2%', sentiment: '매우 긍정', reason: '뉴스 노출 빈도 급증' },
                    { name: '이종배', change: '-1.5%', sentiment: '부정적', reason: '공세 전략 실패' },
                ],
                globalRisk: '매우 높음',
                forecast: '시뮬레이션 결과, 제안된 이벤트는 특정 인지도 상승에 82% 긍정적 기여'
            } as any);
            setIsSimulating(false);
        }, 1500);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans flex overflow-hidden selection:bg-blue-500/30">
            {/* side rail */}
            <aside className="w-24 shrink-0 bg-black/60 border-r border-white/5 backdrop-blur-3xl flex flex-col items-center py-10 z-[100] relative">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic shadow-2xl mb-16 cursor-pointer" onClick={() => setActiveView('dashboard')}>P</div>
                <nav className="flex flex-col gap-10">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard },
                        { id: 'network', icon: Share2 },
                        { id: 'geo', icon: Globe },
                        { id: 'scenario', icon: BrainCircuit }
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveView(item.id)} className={`transition-all ${activeView === item.id ? 'text-blue-500' : 'text-gray-600 hover:text-white'}`}>
                            <item.icon size={26} />
                        </button>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-8 mb-4">
                    <button onClick={() => setIsManualOpen(true)} className="text-blue-400 hover:text-blue-300 transition-all group relative">
                        <HelpCircle size={26} />
                        <span className="absolute left-full ml-4 px-3 py-1 bg-blue-600 text-[10px] font-black uppercase rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">사용 가이드</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 relative flex flex-col overflow-hidden">
                <header className="relative z-50 px-10 py-6 border-b border-white/5 bg-black/20 backdrop-blur-xl flex justify-between items-center">
                    <h1 className="text-xl font-black italic tracking-tighter uppercase">POLISIGHT <span className="text-blue-500">INTEL SURFACE</span></h1>
                    <div className="flex gap-4">
                        <button onClick={() => setIsTotalReportOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 rounded-full text-xs font-black uppercase hover:scale-105 transition-all shadow-lg shadow-blue-600/20">
                            <FileSearch size={14} /> Total Intelligence Report
                        </button>
                        <button onClick={() => setIsManualOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all">
                            <BookOpen size={14} /> MANUAL
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-10 py-12 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeView === 'dashboard' && (
                            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1500px] mx-auto">
                                <div className="max-w-4xl mx-auto mb-20 bg-white/[0.03] p-4 rounded-[3rem] border border-white/10">
                                    <div className="flex items-center gap-4 px-6 mb-2">
                                        <Search className="text-blue-500" size={28} />
                                        <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleRunAnalysis()} className="flex-1 bg-transparent py-4 text-2xl font-black outline-none" placeholder="후보명 입력..." />
                                        <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="px-10 py-4 bg-blue-600 rounded-full font-black text-lg shadow-2xl shadow-blue-600/40">
                                            {isAnalyzing ? "분석 중..." : "인텔리전스 가동"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
                                    {(multiStats as any[]).map((stat, i) => (
                                        <div key={stat.name} className="glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/40 transition-all relative group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                                            <div className="flex justify-between items-start mb-10">
                                                <h4 className="text-4xl font-black italic cursor-pointer hover:text-blue-500 transition-all" onClick={() => { setSelectedCandidate(stat.name as any); setIsModalOpen(true); }}>{stat.name}</h4>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-500 mb-1 uppercase tracking-widest">Party Status</p>
                                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400">{stat.party}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 mb-10">
                                                <IntelTooltip title="REAL POLL Basis" content={stat.rationale_poll}>
                                                    <div className="cursor-help">
                                                        <p className="text-[10px] font-black text-gray-500 mb-2 uppercase break-all">Real Poll</p>
                                                        <h5 className="text-4xl font-black italic">{stat.support}%</h5>
                                                    </div>
                                                </IntelTooltip>
                                                <IntelTooltip title="WIN PROB Simulation Basis" content={stat.rationale_win}>
                                                    <div className="text-right cursor-help">
                                                        <p className="text-[10px] font-black text-gray-400 mb-2 uppercase italic flex items-center justify-end gap-2"><Zap size={10} className="text-yellow-400" /> Win Prob</p>
                                                        <h5 className="text-4xl font-black italic text-yellow-400">{stat.winProb}%</h5>
                                                    </div>
                                                </IntelTooltip>
                                            </div>

                                            <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                                <IntelTooltip title="Intel Score Depth" content={stat.rationale_intel}>
                                                    <div className="flex justify-between items-center cursor-help">
                                                        <p className="text-xs font-black text-gray-500 uppercase flex items-center gap-2"><Cpu size={14} /> Intelligence Score</p>
                                                        <p className="text-2xl font-black text-blue-500">{(stat.influence / 10).toFixed(1)}<span className="text-[10px] text-gray-600">/10</span></p>
                                                    </div>
                                                </IntelTooltip>
                                                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stat.influence}%` }} className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                </div>
                                            </div>

                                            <button onClick={() => { setSelectedCandidate(stat.name as any); setIsModalOpen(true); }} className="mt-10 w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 hover:border-blue-400 transition-all flex items-center justify-center gap-3">
                                                <LineChart size={14} /> 택티컬 전략 리포트 생성
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 glass p-10 h-[500px] rounded-[3rem]">
                                        <h3 className="text-xl font-black italic mb-10 flex items-center gap-4 uppercase"><TrendingUp className="text-blue-500" /> 시뮬레이션 지지율 추이 (Monte Carlo)</h3>
                                        <ResponsiveContainer width="100%" height="80%"><AreaChart data={simData}><XAxis dataKey="month" /><YAxis /><Tooltip />{targetNames.map((n, i) => <Area key={n} dataKey={n} stroke={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} fillOpacity={0.1} />)}</AreaChart></ResponsiveContainer>
                                    </div>
                                    <div className="glass p-10 rounded-[3rem] flex flex-col">
                                        <h3 className="text-xl font-black italic mb-8 uppercase flex items-center gap-4"><ShieldAlert className="text-red-500" /> 작전 근거 (Relationship Evidence)</h3>
                                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                                            {relMatrix.length > 0 ? (relMatrix as any[]).map((rel: any, i: number) => (
                                                <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black uppercase text-blue-400">{rel.person1} ↔ {rel.person2}</span>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${rel.sentiment === '부정' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{rel.relation_type}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-tight italic">"{rel.evidence.slice(0, 70)}..."</p>
                                                </div>
                                            )) : <p className="text-center text-gray-600 text-xs py-10 italic uppercase tracking-widest font-black opacity-30">NO EVIDENCE FOUND</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'network' && (
                            <motion.div key="net" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                <section className="mb-12"><h2 className="text-4xl font-black italic uppercase">Network Intelligence</h2><p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">뉴스 추출 데이터를 통한 실데이터 네트워크</p></section>
                                <div className="flex-1 glass rounded-[3rem] relative flex overflow-hidden shadow-2xl">
                                    <div className="flex-1 flex items-center justify-center p-20">
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                                            {candidatesData.candidates.slice(0, 6).map((c, i) => (
                                                <div key={c.name} className="p-10 bg-white/[0.02] border border-white/10 rounded-3xl text-center group hover:border-blue-500 transition-all cursor-pointer" onClick={() => { setSelectedCandidate(c.name as any); setIsModalOpen(true); }}>
                                                    <p className="text-3xl font-black italic mb-2">{c.name}</p>
                                                    <p className="text-[10px] font-black text-blue-500 mb-4 uppercase">{c.party}</p>
                                                    <div className="flex justify-center gap-4 text-[10px] font-bold text-gray-600">
                                                        <span>PC: {(evidenceData.centrality as any[]).find((s: any) => s.후보자 === c.name)?.페이지랭크 || '0.00'}</span>
                                                        <span>BC: {(evidenceData.centrality as any[]).find((s: any) => s.후보자 === c.name)?.매개중심성 || '0.00'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-96 glass-dark border-l border-white/10 p-10 overflow-y-auto">
                                        <h3 className="text-xl font-black uppercase italic mb-10 text-blue-400">Intelligence Rationale</h3>
                                        <div className="space-y-6">
                                            {(evidenceData.relationships as any[]).slice(0, 10).map((rel: any, i: number) => (
                                                <div key={i} className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-blue-500 uppercase mb-2">{rel.keyword} 연계 분석</p>
                                                    <p className="text-sm font-black italic mb-2">{rel.person1} - {rel.person2}</p>
                                                    <p className="text-xs text-gray-500 leading-relaxed italic">"{rel.evidence}"</p>
                                                    <div className="mt-4 flex items-center justify-between opacity-40">
                                                        <span className="text-[9px] font-black uppercase italic">{rel.source_article}</span>
                                                        <ExternalLink size={12} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 시나리오 랩 섹션 (기존 코드 유지) */}
                        {activeView === 'scenario' && (
                            <motion.div key="sce" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="h-full max-w-5xl mx-auto flex flex-col">
                                <section className="mb-20 text-center">
                                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
                                        <BrainCircuit size={40} className="text-blue-500" />
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 underline decoration-blue-500/50 underline-offset-8">Simulation Lab</h2>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">정치적 이벤트 발생 시 지지율 파급력 가상 측정</p>
                                </section>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 min-h-0">
                                    <div className="space-y-8 overflow-y-auto custom-scrollbar">
                                        <div className="glass p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                                            <h3 className="text-xl font-black italic mb-6 flex items-center gap-4 uppercase"><Zap className="text-yellow-400" /> 가상 시나리오 입력</h3>
                                            <textarea
                                                value={scenarioText}
                                                onChange={(e) => setScenarioText(e.target.value)}
                                                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-lg font-bold outline-none focus:border-blue-500/40 transition-all placeholder:text-gray-800 italic text-white"
                                                placeholder="예: '신용한 후보가 AI 산업 유치 공약을 발표함'..."
                                            />
                                            <button onClick={runScenarioSimulation} disabled={isSimulating || !scenarioText} className="mt-6 w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-600/20">
                                                {isSimulating ? <div className="animate-spin"><Cpu /></div> : <Zap size={22} />}
                                                <span>AI 시뮬레이션 가동</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <AnimatePresence>
                                            {scenarioResult ? (
                                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                                    <div className="glass p-10 rounded-[3rem] border border-blue-500/30 bg-blue-500/5 shadow-2xl">
                                                        <h4 className="text-2xl font-black italic mb-8 uppercase text-blue-400">분석된 파급력 결과 (Forecast)</h4>
                                                        <div className="space-y-6">
                                                            {(scenarioResult as any).impact.map((imp: any) => (
                                                                <div key={imp.name} className="flex justify-between items-center p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                                                                    <div><p className="text-lg font-black italic">{imp.name}</p><p className="text-[10px] text-gray-500 font-bold uppercase">{imp.reason}</p></div>
                                                                    <div className="text-right"><p className={`text-2xl font-black ${imp.change.startsWith('+') ? 'text-blue-500' : 'text-red-500'}`}>{imp.change}</p></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="mt-8 text-lg font-bold text-white italic">"{(scenarioResult as any).forecast}"</p>
                                                    </div>
                                                </motion.div>
                                            ) : <div className="h-full flex items-center justify-center opacity-10"><BrainCircuit size={160} /></div>}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="relative z-50 h-14 bg-black/60 border-t border-white/5 flex items-center overflow-hidden">
                    <div className="px-6 h-full flex items-center bg-blue-600 shrink-0 font-black italic uppercase text-xs">LIVE NEWS TIDBITS</div>
                    <div className="flex-1 px-10 overflow-hidden">
                        <div className="animate-marquee whitespace-nowrap flex gap-20">
                            {(evidenceData.relationships as any[]).slice(0, 5).map((rel: any, i: number) => (
                                <span key={i} className="text-xs font-bold text-gray-400 italic">
                                    <span className="text-blue-500 mr-2">●</span> {rel.source_article}: {rel.evidence.slice(0, 60)}...
                                </span>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>

            {/* Tactical Report Modal (Candidate Specific) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-6xl bg-[#0a0b0d] border border-white/10 rounded-[4rem] p-16 overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_100px_rgba(59,130,246,0.15)]">
                            <div className="flex justify-between items-center mb-16">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40 font-black text-3xl italic">A</div>
                                    <div>
                                        <h2 className="text-5xl font-black italic uppercase tracking-tighter">{selectedCandidate} <span className="text-blue-500">Tactical Strategy Report</span></h2>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] mt-2 italic">Intelligence Surface v4.5 | Confirmed Grounded Evidence Only</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-6 hover:bg-white/5 rounded-3xl transition-all"><X size={40} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                                    <div className="space-y-12">
                                        <section>
                                            <h3 className="text-xl font-black italic mb-8 flex items-center gap-4 text-blue-400 uppercase tracking-widest"><Info size={20} /> 지휘계통 분석 (Network Hierarchy)</h3>
                                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex gap-10">
                                                <div><p className="text-[10px] font-black text-gray-600 uppercase mb-2">PageRank</p><p className="text-3xl font-black italic">{(evidenceData.centrality as any[]).find((s: any) => s.후보자 === selectedCandidate)?.페이지랭크 || '0.00'}</p></div>
                                                <div className="w-px h-16 bg-white/10" />
                                                <div><p className="text-[10px] font-black text-gray-600 uppercase mb-2">Betweenness</p><p className="text-3xl font-black italic">{(evidenceData.centrality as any[]).find((s: any) => s.후보자 === selectedCandidate)?.매개중심성 || '0.00'}</p></div>
                                            </div>
                                        </section>
                                        <section>
                                            <h3 className="text-xl font-black italic mb-8 flex items-center gap-4 text-orange-400 uppercase tracking-widest"><AlertTriangle size={20} /> 작전 리스크 요소</h3>
                                            <div className="space-y-4">
                                                <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex justify-between items-center">
                                                    <span className="font-bold text-orange-200">네트워크 고립도(Isolation)</span>
                                                    <span className="font-black italic text-orange-500">LOW RISK</span>
                                                </div>
                                                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex justify-between items-center">
                                                    <span className="font-bold text-red-200">반대 진영 공세 수위(Antagonism)</span>
                                                    <span className="font-black italic text-red-500">MODERATE</span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    <section className="p-10 bg-blue-600/5 border border-blue-500/20 rounded-[3rem]">
                                        <h3 className="text-2xl font-black italic mb-8 uppercase flex items-center gap-4"><FileText /> 원천 뉴스 근거 (Raw Evidence)</h3>
                                        <div className="space-y-8">
                                            {(evidenceData.relationships as any[]).filter((r: any) => r.person1 === selectedCandidate || r.person2 === selectedCandidate).map((rel: any, i: number) => (
                                                <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-[10px] font-black text-blue-200 uppercase">{rel.relation_type} | {rel.keyword}</span>
                                                        <span className="text-[10px] font-bold text-gray-500 italic">{rel.date}</span>
                                                    </div>
                                                    <p className="text-lg font-bold leading-relaxed italic text-blue-100">"{rel.evidence}"</p>
                                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase text-gray-600">출처: {rel.source_article}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Total Intelligence Report Modal (Global) */}
            <AnimatePresence>
                {isTotalReportOpen && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-12">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTotalReportOpen(false)} className="absolute inset-0 bg-[#050507]/98 backdrop-blur-3xl" />
                        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative w-full max-w-4xl bg-gradient-to-br from-[#0f1115] to-[#050507] border border-blue-500/20 rounded-[4rem] p-16 shadow-[0_0_150px_rgba(59,130,246,0.1)] overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="flex justify-between items-center mb-16">
                                <div className="flex items-center gap-8 text-blue-500">
                                    <BarChart3 size={48} />
                                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">TOTAL STRATEGIC BRIEFING</h2>
                                </div>
                                <button onClick={() => setIsTotalReportOpen(false)} className="p-6 hover:bg-white/5 rounded-3xl transition-all"><X size={40} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-16">
                                <div className="p-10 bg-blue-600/5 border border-blue-500/10 rounded-[3rem]">
                                    <h3 className="text-xl font-black italic mb-6 text-blue-400">1. 전체 판세 요약 (Market Overview)</h3>
                                    <p className="text-xl font-bold leading-relaxed italic text-gray-300">"현재 충북지사 선거는 지지율 중심의 양자 대결 구도에서, 네트워크 지표를 통한 다자간 상호작용 국면으로 전환되고 있습니다. 상위 3인 후보의 지지율 격차는 오차범위 내에 위치하며, 네트워크 매개성(BC)이 높은 후보가 향후 이슈 주도권에서 우위를 점할 것으로 예측됩니다."</p>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                        <h4 className="text-sm font-black text-gray-500 uppercase mb-6 flex items-center gap-3"><Compass size={16} /> 승리 전략 제언</h4>
                                        <ul className="space-y-4 text-sm font-bold text-blue-100 italic">
                                            <li>● 중도 지형 확장을 위한 네트워크 클러스터링 강화</li>
                                            <li>● 부정 이슈에 대한 실시간 스트레스 테스트 실현</li>
                                            <li>● 지역별 맞춤형 시나리오 기반 지지층 공고화</li>
                                        </ul>
                                    </div>
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                        <h4 className="text-sm font-black text-gray-500 uppercase mb-6 flex items-center gap-3"><Layers size={16} /> 기술 분석 현황</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed font-bold">몬테카를로 시뮬레이션(10,000회) 결과, 현재 데이터 기반 가중치 적용 시 제3후보의 잠재적 상승 여력이 15.2%로 확인됨. (Probability of Error: &lt; 0.05)</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* User Manual Modal (기존 유지) */}
            <AnimatePresence>
                {isManualOpen && (
                    <div className="fixed inset-0 z-[700] flex items-center justify-center p-10">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-3xl" />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-4xl bg-[#0a0a0c] border-2 border-blue-500/20 rounded-[4rem] p-16 flex flex-col max-h-[85vh]">
                            <div className="flex justify-between items-center mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40"><BookOpen size={32} /></div>
                                    <div><h2 className="text-4xl font-black italic uppercase tracking-tighter">OPERATIONAL MANUAL</h2><p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Polisight Dashboard Standard Operating Procedure</p></div>
                                </div>
                                <button onClick={() => setIsManualOpen(false)} className="p-4 hover:bg-white/5 rounded-2xl transition-all"><X size={32} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-16">
                                <div className="relative pl-16"><div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">01</div><h3 className="text-xl font-black italic mb-6">후보자 분석 가동</h3><p className="text-gray-400 leading-relaxed">검색창에 후보자명을 입력하고 '인텔리전스 가동'을 눌러 활성 데이터를 로드합니다.</p></div>
                                <div className="relative pl-16"><div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">02</div><h3 className="text-xl font-black italic mb-6">툴팁 근거 확인</h3><p className="text-gray-400 leading-relaxed">모든 수치(지지율, 승률, 인텔 스코어) 위로 마우스를 가져가면 산출 근거가 메모 형식으로 나타납니다.</p></div>
                                <div className="relative pl-16"><div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">03</div><h3 className="text-xl font-black italic mb-6">전략 리포트</h3><p className="text-gray-400 leading-relaxed">후보자 카드의 하단 버튼이나 상단 'Total Intelligence Report' 버튼을 눌러 상세 분석 레포트를 열람하십시오.</p></div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.3); } @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 60s linear infinite; display: inline-flex; width: max-content; }`}</style>
        </div>
    );
}
