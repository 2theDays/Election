"use client";

import React, { useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Cpu, BookOpen, LayoutDashboard, User, Globe, FileText, X, PieChart as PieIcon, BarChart3, Info,
    Share2, Layers, Compass, BrainCircuit, Newspaper, Link2, ExternalLink, HelpCircle, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 데이터 소스 ---
import candidatesData from '../../candidates_data.json';
import evidenceData from '../../evidence_data.json';

const getCandidateStats = (name: string) => {
    const found = candidatesData.candidates.find(c => c.name === name);
    const scores: any = (evidenceData.centrality as any[]).find((s: any) => s.후보자 === name);

    if (found) {
        return {
            party: found.party,
            support: found.poll_support,
            influence: scores ? parseFloat(scores.종합점수) * 100 : 0.5 + (found.poll_support / 20),
            risk: Math.floor(Math.random() * 20 + 10),
            winProb: Math.floor(found.poll_support * 5 + Math.random() * 10),
            scores: scores
        };
    }
    return { party: "기타", support: 5.0, influence: 20, risk: 25, winProb: 15, scores: null };
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

const REGIONS = [
    { id: 'cheongju', name: '청주시', leader: '신용한', support: 32.4, color: '#3b82f6' },
    { id: 'chungju', name: '충주시', leader: '이종배', support: 45.1, color: '#ef4444' },
    { id: 'jincheon', name: '진천군', leader: '송기섭', support: 52.3, color: '#10b981' },
];

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
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Reality Based Grounds Entry</span>
                        <button onClick={() => setIsManualOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-full text-blue-400 hover:bg-blue-600/20 transition-all">
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
                                        <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="px-10 py-4 bg-blue-600 rounded-full font-black text-lg">
                                            {isAnalyzing ? "분석 중..." : "인텔리전스 가동"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                                    {(multiStats as any[]).map((stat, i) => (
                                        <div key={stat.name} className="glass p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/40 transition-all relative group overflow-hidden">
                                            <h4 className="text-3xl font-black italic mb-2">{stat.name}</h4>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-500 mb-1">REAL POLL</p>
                                                    <h5 className="text-4xl font-black italic">{stat.support}%</h5>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-500 mb-1">INTEL SCORE</p>
                                                    <h5 className="text-xl font-black text-blue-500">{(stat.influence / 10).toFixed(1)}/10</h5>
                                                </div>
                                            </div>
                                            <button onClick={() => { setSelectedCandidate(stat.name as any); setIsModalOpen(true); }} className="mt-8 w-full py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all">실제 근거 확인</button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 glass p-10 h-[500px] rounded-[3rem]">
                                        <h3 className="text-xl font-black italic mb-10 flex items-center gap-4 uppercase"><TrendingUp className="text-blue-500" /> 종합 지지율 변동 (Simulation)</h3>
                                        <ResponsiveContainer width="100%" height="80%"><AreaChart data={simData}><XAxis dataKey="month" /><YAxis /><Tooltip />{targetNames.map((n, i) => <Area key={n} dataKey={n} stroke={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} fillOpacity={0.1} />)}</AreaChart></ResponsiveContainer>
                                    </div>
                                    <div className="glass p-10 rounded-[3rem] flex flex-col">
                                        <h3 className="text-xl font-black italic mb-8 uppercase flex items-center gap-4"><ShieldAlert className="text-red-500" /> 실제 추출 관계망 (Evidence)</h3>
                                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                                            {relMatrix.length > 0 ? (relMatrix as any[]).map((rel: any, i: number) => (
                                                <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black uppercase">{rel.person1} ↔ {rel.person2}</span>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${rel.sentiment === '부정' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{rel.relation_type}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-tight italic">"{rel.evidence.slice(0, 50)}..."</p>
                                                </div>
                                            )) : <p className="text-center text-gray-600 text-xs py-10 italic">선택된 후보 간 직접적 근거 정보가 없습니다.</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'network' && (
                            <motion.div key="net" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                <section className="mb-12"><h2 className="text-4xl font-black italic uppercase">Network Intelligence</h2><p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">뉴스 추출 데이터를 통한 실데이터 네트워크</p></section>
                                <div className="flex-1 glass rounded-[3rem] relative flex overflow-hidden">
                                    <div className="flex-1 flex items-center justify-center p-20">
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                                            {candidatesData.candidates.slice(0, 6).map((c, i) => (
                                                <div key={c.name} className="p-10 bg-white/[0.02] border border-white/10 rounded-3xl text-center group hover:border-blue-500 transition-all">
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
                                        <h3 className="text-xl font-black uppercase italic mb-10">Intelligence Rationale</h3>
                                        <div className="space-y-6">
                                            {(evidenceData.relationships as any[]).slice(0, 10).map((rel: any, i: number) => (
                                                <div key={i} className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                                                    <p className="text-[10px] font-black text-blue-500 uppercase mb-2">{rel.keyword} 연계 분석</p>
                                                    <p className="text-sm font-black italic mb-2">{rel.person1} - {rel.person2}</p>
                                                    <p className="text-xs text-gray-500 leading-relaxed">"{rel.evidence}"</p>
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
                                            <button onClick={runScenarioSimulation} disabled={isSimulating || !scenarioText} className="mt-6 w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-4">
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
                                    <span className="text-blue-500 mr-2">●</span> {rel.source_article}: {rel.evidence.slice(0, 40)}...
                                </span>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>

            {/* Tactical Report Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl bg-[#0a0a0c] border border-white/10 rounded-[4rem] p-12 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-4xl font-black italic uppercase">{selectedCandidate} GROUNDED ANALYSIS</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/5 rounded-2xl transition-all"><X size={32} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-12">
                                <section className="p-10 bg-blue-600 rounded-[3rem]">
                                    <h3 className="text-2xl font-black italic mb-6">추출된 핵심 근거 (Rationales)</h3>
                                    <div className="space-y-6">
                                        {(evidenceData.relationships as any[]).filter((r: any) => r.person1 === selectedCandidate || r.person2 === selectedCandidate).map((rel: any, i: number) => (
                                            <div key={i} className="p-6 bg-white/10 rounded-2xl border border-white/10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-black uppercase text-blue-200">{rel.relation_type} | {rel.keyword}</span>
                                                    <span className="text-[10px] font-bold text-blue-100 italic">{rel.date}</span>
                                                </div>
                                                <p className="text-lg font-bold leading-relaxed">"{rel.evidence}"</p>
                                                <p className="mt-4 text-[10px] font-black uppercase opacity-60">Source: {rel.source_article}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* User Manual Modal */}
            <AnimatePresence>
                {isManualOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-10">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-3xl" />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-4xl bg-[#0a0a0c] border-2 border-blue-500/20 rounded-[4rem] p-16 overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="flex justify-between items-center mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40">
                                        <BookOpen size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">OPERATIONAL MANUAL</h2>
                                        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Polisight Dashboard Standard Operating Procedure</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsManualOpen(false)} className="p-4 hover:bg-white/5 rounded-2xl transition-all"><X size={32} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-16">
                                {/* Step 1 */}
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">01</div>
                                    <h3 className="text-xl font-black italic mb-6 flex items-center gap-4">후보자 분석 가동 <ChevronRight size={18} className="text-blue-500" /></h3>
                                    <p className="text-gray-400 leading-relaxed mb-6">메인 화면의 검색창에 분석하고자 하는 **후보자의 성함**을 입력하세요. 콤마(,)로 구분하여 여러 명을 동시 분석할 수 있습니다. 상위 지지율 후보는 하단 태그를 통해 즉시 선택 가능합니다.</p>
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4">
                                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                        <p className="text-xs font-bold italic text-gray-500 group">입입력 예시: "신용한, 노영민, 이종배" 입력 후 '인텔리전스 가동' 클릭</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">02</div>
                                    <h3 className="text-xl font-black italic mb-6 flex items-center gap-4">실데이터 근거(Evidence) 확인 <ChevronRight size={18} className="text-blue-500" /></h3>
                                    <p className="text-gray-400 leading-relaxed mb-6">각 후보자 카드 상의 **[실제 근거 확인]**을 클릭하면, AI가 실제 뉴스 기사와 공공 데이터를 분석하여 도출한 증거 문구들을 볼 수 있습니다. 모든 지표는 실제 사실에 기반합니다.</p>
                                    <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl flex items-center gap-4">
                                        <Activity size={18} className="text-blue-500 shrink-0" />
                                        <p className="text-xs font-bold text-blue-100">중심도 점수(PC, BC)는 후보자의 정치적 역학 관계 지배력을 의미합니다.</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="relative pl-16">
                                    <div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">03</div>
                                    <h3 className="text-xl font-black italic mb-6 flex items-center gap-4">시뮬레이션 가동 <ChevronRight size={18} className="text-blue-500" /></h3>
                                    <p className="text-gray-400 leading-relaxed mb-6">좌측 로보틱 아이콘(Scenario Lab)을 통해 가상의 정치적 상황을 입력해 보세요. "특정 후보의 공약 발표" 등의 시나리오는 전체 판세의 승률과 리스크에 실시간 영향을 줍니다.</p>
                                    <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl flex items-center gap-4">
                                        <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
                                        <p className="text-xs font-bold text-yellow-100">주의: 시뮬레이션 결과는 예측치이므로 실제 개표 결과와 다를 수 있습니다.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] italic text-gray-700">
                                <span>Copyright 2026 Polisight Inc.</span>
                                <span>System version 4.5.2-Alpha</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.3); } @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 60s linear infinite; display: inline-flex; width: max-content; }`}</style>
        </div>
    );
}
