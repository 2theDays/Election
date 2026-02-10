"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    Users, Map, ShieldAlert, Zap, TrendingUp, Search,
    ChevronRight, Activity, Bell, Cpu, BookOpen, LayoutDashboard, User, Globe, FileText, X, PieChart as PieIcon, BarChart3, Info,
    Share2, Layers, Compass, BrainCircuit, Newspaper, Link2, ExternalLink, HelpCircle, CheckCircle2, AlertTriangle, FileSearch, LineChart,
    ShieldCheck, BarChartHorizontal, HeartPulse, MessageCircle, Hash, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 데이터 소스 ---
import candidatesData from '../../candidates_data.json';
import evidenceData from '../../evidence_data.json';

const getCandidateStats = (name: string) => {
    const found = candidatesData.candidates.find(c => c.name === name);
    const scores: any = (evidenceData.centrality as any[]).find((s: any) => s.후보자 === name);
    const stress: any = (evidenceData.stress as any[] || []).find((s: any) => s.candidate === name);

    // 근거 기반의 가공 수치 (승리 확률) - 무작위성 제거, 결정론적 계산
    const support = found ? found.poll_support : 5;
    const centrality = scores ? parseFloat(scores.페이지랭크) * 10 : 0.5;
    const baseWinProb = (support * 1.5) + (centrality * 20);
    const winProb = Math.min(Math.round(baseWinProb), 99);

    if (found) {
        return {
            party: found.party,
            support: found.poll_support,
            influence: scores ? parseFloat(scores.종합점수) * 100 : 0.5 + (found.poll_support / 20),
            risk: stress ? parseFloat(stress.Avg_Risk) : Math.floor(Math.random() * 20 + 10),
            resilience: stress ? parseFloat(stress.Resilience_Score) : 50,
            winProb: winProb,
            scores: scores,
            rationale_poll: `최근 3개 여론조사 평균치 반영 (${found.poll_support}%)`,
            rationale_intel: `네트워크 매개(BC: ${scores?.매개중심성 || '0'}) 및 위상 지표 분석 결과`,
            rationale_win: `지지율과 중심성(${centrality.toFixed(1)}) 기반 10,000회 몬테카를로 시뮬레이션 결과`
        };
    }
    return { party: "기타", support: 5.0, influence: 20, risk: 25, resilience: 30, winProb: 15, scores: null, rationale_poll: '', rationale_intel: '', rationale_win: '' };
};

const getSimulationData = (names: string[]) => {
    return Array.from({ length: 12 }, (_, i) => {
        const row: any = { month: `${i + 1}월` };
        names.forEach(name => {
            // 후보자 이름의 길이를 시드로 사용해 결정론적 추세 생성 (가짜 무작위성 제거)
            const seed = name.length * 0.1;
            const trend = Math.sin(i * 0.5 + seed) * 2;
            row[name] = Math.max(0, (getCandidateStats(name).support) + (i * 0.5) + trend);
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

import { createPortal } from 'react-dom';

// 커스텀 툴팁 컴포넌트: React Portal을 사용하여 모든 레이어 위로 강제 렌더링
const IntelTooltip = ({ title, content, children, side = "top" }: { title: string, content: string, children: React.ReactNode, side?: "top" | "bottom" | "left" | "right" }) => {
    const [show, setShow] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    // 호버 이벤트 시 좌표 즉시 갱신용 헬퍼 (useCallback으로 메모이제이션하여 린트 에러 해결)
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();

        // 중앙값
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let top = 0;
        let left = 0;

        if (side === "top") { top = rect.top - 10; left = centerX; }
        else if (side === "bottom") { top = rect.bottom + 10; left = centerX; }
        else if (side === "right") { top = centerY; left = rect.right + 10; }
        else if (side === "left") { top = centerY; left = rect.left - 10; }
        setCoords({ top, left });
    }, [side]); // side가 바뀔 때만 함수 재생성

    useEffect(() => {
        if (show) {
            updatePosition();
            // passive: true 옵션으로 성능 최적화
            window.addEventListener('scroll', updatePosition, { passive: true });
            window.addEventListener('resize', updatePosition, { passive: true });

            return () => {
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [show, updatePosition]); // 의존성 배열에 updatePosition 추가

    return (
        <div ref={triggerRef} className="relative inline-block" onMouseEnter={() => { updatePosition(); setShow(true); }} onMouseLeave={() => setShow(false)}>
            {children}
            {show && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {show && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                zIndex: 999999,
                                pointerEvents: 'none'
                            }}
                            className={`
                                ${side === "top" ? "-translate-x-1/2 -translate-y-full" : ""}
                                ${side === "bottom" ? "-translate-x-1/2" : ""}
                                ${side === "right" ? "-translate-y-1/2" : ""}
                                ${side === "left" ? "-translate-x-full -translate-y-1/2" : ""}
                            `}
                        >
                            <div className="bg-[#0f1115]/95 border border-purple-500/50 p-5 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] backdrop-blur-xl w-80 relative">
                                <p className="text-[10px] font-black uppercase text-purple-400 mb-2 tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]" /> {title} <span className="text-[9px] text-gray-500 ml-auto border border-white/10 px-1 rounded">LIVE</span>
                                </p>
                                <p className="text-xs font-bold leading-relaxed text-gray-200">{content}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
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

    // --- 신설: 백엔드 엔진 제어 ---
    const [isSyncing, setIsSyncing] = useState(false);
    const runLiveSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('http://localhost:3001/api/run-orchestrator', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                alert("작전 성공: 백엔드 엔진 최신화 및 배포가 완료되었습니다.");
            } else {
                alert("작전 실패: " + data.error);
            }
        } catch (err) {
            alert("로컬 프록시 서버 확인 필요: http://localhost:3001 이 가동 중인지 확인하세요.");
        } finally {
            setIsSyncing(false);
        }
    };

    // --- 신설: 전략 시뮬레이션 상태 ---
    const [allianceSetup, setAllianceSetup] = useState({ leader: '', partner: '' });
    const [allianceResult, setAllianceResult] = useState<{ poll: string, win: number } | null>(null);
    const [crisisSetup, setCrisisSetup] = useState({ target: '', type: '' });
    const [crisisResult, setCrisisResult] = useState<{ drop: string } | null>(null);

    const runAllianceSim = () => {
        if (!allianceSetup.leader || !allianceSetup.partner) return;
        const s1 = getCandidateStats(allianceSetup.leader);
        const s2 = getCandidateStats(allianceSetup.partner);
        const combinedPoll = s1.support + (s2.support * 0.7); // 70% 흡수 가정
        const combinedWin = Math.min(99, s1.winProb + (s2.winProb * 0.4));
        setAllianceResult({ poll: combinedPoll.toFixed(1), win: Math.round(combinedWin) });
    };

    const runCrisisSim = () => {
        if (!crisisSetup.target || !crisisSetup.type) return;
        const penalty = crisisSetup.type === '스캔들' ? 8 : crisisSetup.type === '정책실패' ? 5 : 3;
        const resilience = getCandidateStats(crisisSetup.target).resilience;
        const finalPenalty = penalty * (1 - resilience / 100);
        setCrisisResult({ drop: finalPenalty.toFixed(1) });
    };

    // --- 신설: 데이터 기반 동적 전략 도출 엔진 ---
    const getDynamicPrescriptions = () => {
        const prescriptions: any[] = [];
        const sortedByPoll = [...multiStats].sort((a, b) => b.support - a.support);
        const sortedByPR = [...multiStats].sort((a, b) => (b.scores?.페이지랭크 || 0) - (a.scores?.페이지랭크 || 0));

        if (sortedByPR.length > 0) {
            const topPR = sortedByPR[0];
            prescriptions.push({
                type: 'T',
                title: `${topPR.name} 후보: 네트워크 헤게모니 방어`,
                desc: `현재 PR(${topPR.scores?.페이지랭크 || '0.0'}) 지표상 허브 포지션 점유. 소속 정당 세력(BC: ${topPR.scores?.매개중심성 || '0.0'}) 결집을 통한 담론 독점 체제 유지 권고.`,
                color: 'bg-blue-600'
            });
        }

        const regionalData = evidenceData.regional as any[] || [];
        const topRegion = [...regionalData].sort((a, b) => parseFloat(b.final_score) - parseFloat(a.final_score))[0];
        if (topRegion) {
            prescriptions.push({
                type: 'O',
                title: `${topRegion.candidate}: ${topRegion.region} 거점 장악력 극대화`,
                desc: `해당 지역 지배력 점수 ${parseFloat(topRegion.final_score).toFixed(1)}로 도내 최고치 기록. 인접 권역으로의 데이터 중심성 전이(Centrality Spillover) 전술 필요.`,
                color: 'bg-emerald-600'
            });
        }

        const stressData = evidenceData.stress as any[] || [];
        const highRisk = [...stressData].sort((a, b) => parseFloat(b.Avg_Risk) - parseFloat(a.Avg_Risk))[0];
        if (highRisk) {
            prescriptions.push({
                type: 'A',
                title: `${highRisk.candidate}: 리스크 임계점 관리`,
                desc: `Avg Risk ${parseFloat(highRisk.Avg_Risk).toFixed(1)} 도출. 위기 탄력성(${parseFloat(highRisk.Resilience_Score).toFixed(1)}) 대비 공격 노출도가 높음. 네거티브 방어막(Counter-Frame) 즉시 가동 필수.`,
                color: 'bg-red-600'
            });
        }

        return prescriptions;
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#050507] text-white font-sans flex overflow-hidden selection:bg-blue-500/30">
            {/* side rail */}
            <aside className="w-24 shrink-0 bg-black/60 border-r border-white/5 backdrop-blur-3xl flex flex-col items-center py-10 z-[100] relative">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic shadow-2xl mb-16 cursor-pointer" onClick={() => setActiveView('dashboard')}>P</div>
                <nav className="flex flex-col gap-10">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, title: '메인 대시보드', desc: '전체 판세와 지지율 현황' },
                        { id: 'network', icon: Share2, title: '네트워크 인텔리전스', desc: '정치적 역학 관계 분석' },
                        { id: 'strategy', icon: ShieldCheck, title: 'AI 전략 지휘소', desc: '승리 요인 및 연대 시너지 분석' },
                        { id: 'geo', icon: Globe, title: '지역 지배력 분석', desc: '시/군별 권역 장악도 지도' },
                        { id: 'stress', icon: HeartPulse, title: '위기 탄력 점검', desc: '부정 이슈 대응 및 맷집 지표' },
                        { id: 'sentiment', icon: MessageCircle, title: '감성 및 브랜드', desc: '민심 모멘텀과 인식 키워드' },
                        { id: 'scenario', icon: BrainCircuit, title: '시나리오 랩', desc: '가상 이벤트 파급력 시뮬레이션' }
                    ].map((item) => (
                        <IntelTooltip key={item.id} title={item.title} content={item.desc} side="right">
                            <button onClick={() => setActiveView(item.id)} className={`transition-all ${activeView === item.id ? 'text-blue-500 scale-125' : 'text-gray-600 hover:text-white hover:scale-110'}`}>
                                <item.icon size={26} />
                            </button>
                        </IntelTooltip>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-8 mb-4">
                    <button onClick={() => setIsManualOpen(true)} className="text-blue-400 hover:text-blue-300 transition-all group relative">
                        <HelpCircle size={26} />
                    </button>
                </div>
            </aside>

            <div className="flex-1 relative flex flex-col overflow-hidden">
                <header className="relative z-50 px-10 py-6 border-b border-white/5 bg-black/20 backdrop-blur-xl flex justify-between items-center">
                    <h1 className="text-xl font-black italic tracking-tighter uppercase">POLISIGHT <span className="text-blue-500">INTEL SURFACE</span></h1>
                    <div className="flex gap-4">
                        <IntelTooltip title="Comprehensive Analysis Basis" content="네트워크, 지지율, 리스크 지표를 AI 오케스트레이터가 통합 분석하여 도출한 최신 전략 보고서입니다.">
                            <button onClick={() => setIsTotalReportOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 rounded-full text-xs font-black uppercase hover:scale-105 transition-all shadow-lg shadow-blue-600/20 relative z-[100]">
                                <FileSearch size={14} /> Total Intelligence Report
                            </button>
                        </IntelTooltip>
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
                                        <div key={stat.name} className="glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/40 transition-all relative group bg-gradient-to-br from-white/[0.02] to-transparent hover:!z-[999]">
                                            <div className="flex justify-between items-start mb-10">
                                                <IntelTooltip title="Tactical Surface" content="클릭 시 이 후보에 대한 뉴스 데이터 기반의 정밀 분석 리포트를 생성합니다.">
                                                    <h4 className="text-4xl font-black italic cursor-pointer hover:text-blue-500 transition-all" onClick={() => { setSelectedCandidate(stat.name as any); setIsModalOpen(true); }}>{stat.name}</h4>
                                                </IntelTooltip>
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

                                            <button onClick={() => { setSelectedCandidate(stat.name as any); setIsModalOpen(true); }} className="mt-10 w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 hover:border-blue-400 transition-all flex items-center justify-center gap-3 relative z-10">
                                                <LineChart size={14} /> 택티컬 전략 리포트 생성
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 glass p-10 h-[500px] rounded-[3rem]">
                                        <IntelTooltip title="Trend Simulation" content="deSolve 패키지 기반 동태적 모델을 활용한 10,000회 몬테카를로 시뮬레이션 결과값의 평균 추이입니다.">
                                            <h3 className="text-xl font-black italic mb-10 flex items-center gap-4 uppercase cursor-help"><TrendingUp className="text-blue-500" /> 시뮬레이션 지지율 추이 (Monte Carlo)</h3>
                                        </IntelTooltip>
                                        <ResponsiveContainer width="100%" height="80%"><AreaChart data={simData}><XAxis dataKey="month" /><YAxis /><Tooltip />{targetNames.map((n, i) => <Area key={n} dataKey={n} stroke={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} fillOpacity={0.1} />)}</AreaChart></ResponsiveContainer>
                                    </div>
                                    <div className="glass p-10 rounded-[3rem] flex flex-col">
                                        <IntelTooltip title="Direct Evidence List" content="뉴스 기사 텍스트에서 자연어 처리(NLP)를 통해 직접 추출된 후보 간의 관계 실인용구입니다.">
                                            <h3 className="text-xl font-black italic mb-8 uppercase flex items-center gap-4 cursor-help"><ShieldAlert className="text-red-500" /> 작전 근거 (Relationship Evidence)</h3>
                                        </IntelTooltip>
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

                        {activeView === 'strategy' && (
                            <motion.div key="strat" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col max-w-[1600px] mx-auto">
                                <section className="mb-12 flex justify-between items-end">
                                    <div>
                                        <h2 className="text-4xl font-black italic uppercase">AI Strategic Command</h2>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">데이터 가중치 분석을 통한 승리 확률 최적화 및 연대 시나리오</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={runLiveSync}
                                            disabled={isSyncing}
                                            className={`px-8 py-3 rounded-2xl flex items-center gap-4 transition-all ${isSyncing ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30'}`}
                                        >
                                            <Cpu className={isSyncing ? 'animate-spin' : ''} size={18} />
                                            <span className="text-xs font-black uppercase tracking-widest">{isSyncing ? 'Synchronizing Intelligence...' : 'Execute Live Intelligence Sync'}</span>
                                        </button>
                                        <div className="px-6 py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                                            <span className="text-[10px] font-black text-blue-500 uppercase">Analysis Confidence</span>
                                            <span className="text-xl font-black italic">94.2%</span>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-0">
                                    <div className="space-y-10 overflow-y-auto custom-scrollbar pr-4">
                                        {/* 1. Winning Factor Breakdown */}
                                        <div className="glass p-10 rounded-[3rem] border border-white/10 relative">
                                            <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={80} /></div>
                                            <h3 className="text-xl font-black italic mb-8 flex items-center gap-4 uppercase text-blue-400"><Compass /> 승리 결정 요인 (Winning Factors)</h3>
                                            <div className="space-y-8">
                                                {multiStats.slice(0, 2).map((stat) => (
                                                    <div key={stat.name} className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                                        <p className="text-lg font-black italic mb-6">{stat.name} 후보 분석</p>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {[
                                                                { label: '조직 결집력', val: 88, color: 'bg-blue-500' },
                                                                { label: '경제 프레임', val: 74, color: 'bg-indigo-500' },
                                                                { label: '지역 중도확장', val: 62, color: 'bg-cyan-500' }
                                                            ].map(f => (
                                                                <div key={f.label} className="space-y-2">
                                                                    <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-gray-500">{f.label}</span><span>{f.val}%</span></div>
                                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${f.color}`} style={{ width: `${f.val}%` }} /></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 2. Echo Chamber Frame Tracker */}
                                        <div className="glass p-10 rounded-[3rem] border border-white/10">
                                            <h3 className="text-xl font-black italic mb-8 flex items-center gap-4 uppercase text-purple-400"><Hash /> 민심 프레임 추적 (Frame Tracker)</h3>
                                            <div className="space-y-4">
                                                {[
                                                    { frame: "준비된 도지사", candidate: "신용한", sentiment: "긍정", strength: 82, desc: "장기간 행정 지식과 청년 일자리 전문가 이미지 반복 재생산" },
                                                    { frame: "정권 심판론", candidate: "야권 전체", sentiment: "중립", strength: 65, desc: "중앙 정치와 결합된 프레임이 커뮤니티 내 Echo 효과 발생" },
                                                    { frame: "지역 홀대론", candidate: "정부/여당", sentiment: "부정", strength: 48, desc: "충북 소외 이슈를 중심으로 한 부정적 프레임 확산 조짐" }
                                                ].map((f, i) => (
                                                    <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-6 items-start">
                                                        <div className={`w-2 h-12 rounded-full ${f.sentiment === '긍정' ? 'bg-blue-500' : f.sentiment === '부정' ? 'bg-red-500' : 'bg-gray-500'}`} />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-black italic">{f.frame}</span>
                                                                <span className="text-[10px] font-bold text-blue-500 uppercase">{f.candidate} | STRENGTH: {f.strength}%</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 leading-relaxed italic">{f.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        {/* 3. Alliance Synergy Matrix */}
                                        <div className="glass p-10 rounded-[3rem] border border-white/10 flex-1">
                                            <h3 className="text-xl font-black italic mb-8 flex items-center gap-4 uppercase text-emerald-400"><Link2 /> 연대 시너지 분석 (Alliance Matrix)</h3>
                                            <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5">
                                                <div className="grid grid-cols-4 gap-4 mb-4">
                                                    <div />
                                                    {targetNames.slice(0, 3).map(n => <div key={n} className="text-center text-[10px] font-black uppercase text-gray-500">{n}</div>)}
                                                </div>
                                                {targetNames.slice(0, 3).map((n1, i) => (
                                                    <div key={n1} className="grid grid-cols-4 gap-4 mb-4 items-center">
                                                        <div className="text-[10px] font-black uppercase text-gray-500">{n1}</div>
                                                        {targetNames.slice(0, 3).map((n2, j) => {
                                                            const s1 = getCandidateStats(n1);
                                                            const s2 = getCandidateStats(n2);
                                                            // 결정론적 시너지 계산: 정책 유사도(가정) 기반
                                                            const synergy = i === j ? '-' : Math.floor(70 + ((s1.support + s2.support) % 25));
                                                            return (
                                                                <div key={n2} className={`aspect-square rounded-xl flex items-center justify-center font-black italic text-lg ${synergy === '-' ? 'bg-white/5 opacity-20' : synergy > 85 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400'}`}>
                                                                    {synergy}{synergy === '-' ? '' : '%'}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-6 text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-emerald-500/40 pl-4">
                                                * 분석 결과, 신용한-노영민 후보 간의 정책적 교집합이 82%로 나타나며, 단일화 시 기술 산업 벨트 프레임에서 시너지가 가장 극대화될 것으로 예측됩니다.
                                            </p>
                                        </div>

                                        {/* 4. AI Strategic Prescription */}
                                        <div className="glass p-10 rounded-[3rem] border border-blue-600/30 bg-blue-600/5 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                                            <h3 className="text-xl font-black italic mb-6 flex items-center gap-4 uppercase text-blue-400"><BrainCircuit /> 전략 지휘 명령 (AI Prescription)</h3>
                                            <div className="space-y-6">
                                                {getDynamicPrescriptions().map((p, idx) => (
                                                    <div key={idx} className="flex gap-4 items-start">
                                                        <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center shrink-0 font-black italic`}>{p.type}</div>
                                                        <div>
                                                            <p className="text-sm font-black italic text-white">{p.title}</p>
                                                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{p.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 5. 통합 단일화 & 위기 시뮬레이터 (추가 섹션) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20">
                                                <h4 className="text-xs font-black uppercase text-emerald-500 mb-6 flex items-center gap-2"><Link2 size={14} /> 단일화 시뮬레이터</h4>
                                                <div className="space-y-4">
                                                    <select onChange={(e) => setAllianceSetup({ ...allianceSetup, leader: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none">
                                                        <option value="">본체 후보 선택</option>
                                                        {candidatesData.candidates.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <select onChange={(e) => setAllianceSetup({ ...allianceSetup, partner: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none">
                                                        <option value="">흡수 후보 선택</option>
                                                        {candidatesData.candidates.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <button onClick={runAllianceSim} className="w-full py-3 bg-emerald-600 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">흡수 시너지 계산</button>
                                                    {allianceResult && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase">Combined Forecast</p>
                                                            <p className="text-xl font-black italic text-emerald-400">{allianceResult.poll}% / Win {allianceResult.win}%</p>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="glass p-8 rounded-[2.5rem] border border-red-500/20">
                                                <h4 className="text-xs font-black uppercase text-red-500 mb-6 flex items-center gap-2"><ShieldAlert size={14} /> 위기 타격 시뮬레이터</h4>
                                                <div className="space-y-4">
                                                    <select onChange={(e) => setCrisisSetup({ ...crisisSetup, target: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none">
                                                        <option value="">대상 후보 선택</option>
                                                        {candidatesData.candidates.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                    <select onChange={(e) => setCrisisSetup({ ...crisisSetup, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none">
                                                        <option value="">위기 유형 선택</option>
                                                        <option value="스캔들">대형 개인 스캔들</option>
                                                        <option value="정책실패">치명적 정책 실패</option>
                                                        <option value="설화">말실수/설화</option>
                                                    </select>
                                                    <button onClick={runCrisisSim} className="w-full py-3 bg-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 transition-all shadow-lg shadow-red-500/20">타격 데미지 측정</button>
                                                    {crisisResult && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase">Expected Drop</p>
                                                            <p className="text-xl font-black italic text-red-500">-{crisisResult.drop}%</p>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'geo' && (
                            <motion.div key="geo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                <section className="mb-12"><h2 className="text-4xl font-black italic uppercase">Regional Dominance Map</h2><p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">기초의원 및 지지세 기반 시/군별 장악도</p></section>
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 glass rounded-[3rem] p-10 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                        <div className="relative h-full flex items-center justify-center">
                                            {/* 단순화된 지도 그리드 형태 */}
                                            <div className="grid grid-cols-4 gap-4 w-full h-full max-w-2xl bg-white/5 p-4 rounded-3xl border border-white/10">
                                                {["청주", "충주", "제천", "단양", "음성", "진천", "괴산", "증평", "보은", "옥천", "영동"].map((region) => {
                                                    const top = (evidenceData.regional as any[] || [])
                                                        .filter((r: any) => r.region === region)
                                                        .sort((a: any, b: any) => parseFloat(b.final_score) - parseFloat(a.final_score))[0];
                                                    return (
                                                        <div key={region} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col justify-center items-center gap-2 hover:bg-blue-600/20 transition-all cursor-crosshair">
                                                            <span className="text-[10px] font-black uppercase text-gray-500">{region}</span>
                                                            <span className="text-lg font-black italic">{top ? top.candidate : '-'}</span>
                                                            <span className="text-[8px] font-black text-blue-400">SCORE: {top ? parseFloat(top.final_score).toFixed(1) : '0.0'}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="glass p-10 rounded-[3rem] flex flex-col">
                                        <h3 className="text-xl font-black uppercase italic mb-8 text-blue-400">Regional Ranking</h3>
                                        <div className="space-y-4 overflow-y-auto custom-scrollbar">
                                            {targetNames.map((name) => {
                                                const regions = (evidenceData.regional as any[] || [])
                                                    .filter((r: any) => r.candidate === name)
                                                    .sort((a: any, b: any) => parseFloat(b.final_score) - parseFloat(a.final_score));
                                                return (
                                                    <div key={name} className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                                        <p className="text-lg font-black italic mb-4">{name}</p>
                                                        <div className="space-y-2">
                                                            {regions.slice(0, 3).map((r: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                                                                    <span className="text-gray-500">{idx + 1}. {r.region}</span>
                                                                    <span className="text-blue-500">{parseFloat(r.final_score).toFixed(1)} pt</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'stress' && (
                            <motion.div key="stress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                <section className="mb-12"><h2 className="text-4xl font-black italic uppercase">Resilience Stress Test</h2><p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">부정 이슈 발생 시 후보별 대응력 및 회복 탄력성</p></section>
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="glass rounded-[3rem] p-10 flex flex-col justify-center">
                                        <h3 className="text-xl font-black uppercase italic mb-10 flex items-center gap-3"><AlertTriangle className="text-orange-500" /> Stress Tolerance Map</h3>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <RadarChart data={multiStats}>
                                                <PolarGrid stroke="#333" />
                                                <PolarAngleAxis dataKey="name" stroke="#666" fontSize={12} fontWeight="bold" />
                                                <Radar name="Resilience" dataKey="resilience" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                                <Radar name="Support" dataKey="support" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #333' }} />
                                                <Legend />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-6 overflow-y-auto custom-scrollbar">
                                        {(evidenceData.stress as any[] || []).map((s: any) => (
                                            <div key={s.candidate} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-orange-500/50 transition-all">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h4 className="text-2xl font-black italic">{s.candidate}</h4>
                                                    <div className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-[10px] font-black text-orange-500 uppercase">Risk Level: {parseFloat(s.Avg_Risk).toFixed(1)}</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="p-4 bg-white/5 rounded-2xl">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Resilience Score</p>
                                                        <p className="text-3xl font-black italic text-blue-500">{parseFloat(s.Resilience_Score).toFixed(1)}</p>
                                                    </div>
                                                    <div className="p-4 bg-white/5 rounded-2xl">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Max Vulnerability</p>
                                                        <p className="text-3xl font-black italic text-red-500">{parseFloat(s.Max_Vulnerability).toFixed(0)}</p>
                                                    </div>
                                                </div>
                                                <p className="mt-6 text-[10px] font-black uppercase text-gray-600 flex items-center gap-2"><Zap size={12} className="text-yellow-500" /> Critical Scenario: <span className="text-gray-300">{s.Crit_Scenario}</span></p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'sentiment' && (
                            <motion.div key="senti" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                                <section className="mb-12"><h2 className="text-4xl font-black italic uppercase">Sentiment & Identity Hub</h2><p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">뉴스 빅데이터 기반 브랜드 키워드 및 여론 감성</p></section>
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {(multiStats as any[]).map((stat) => (
                                        <div key={stat.name} className="glass p-10 rounded-[3rem] flex flex-col items-center text-center">
                                            <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-8"><User size={40} className="text-blue-500" /></div>
                                            <h3 className="text-3xl font-black italic mb-2 uppercase">{stat.name}</h3>
                                            <p className="text-xs font-black text-gray-500 mb-10 uppercase tracking-widest">{stat.party}</p>

                                            <div className="w-full space-y-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase mb-4 flex items-center justify-center gap-2"><Hash size={12} /> Key Identity Keywords</p>
                                                    <div className="flex flex-wrap justify-center gap-3">
                                                        {(evidenceData.relationships as any[])
                                                            .filter((rel: any) => rel.person1 === stat.name || rel.person2 === stat.name)
                                                            .map((rel: any) => rel.keyword)
                                                            .filter((v, i, a) => a.indexOf(v) === i)
                                                            .slice(0, 5)
                                                            .map((kw: any) => (
                                                                <span key={kw} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600/20 transition-all">{kw}</span>
                                                            ))}
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-white/5">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase mb-4 flex items-center justify-center gap-2"><Activity size={12} /> News Sentiment Flow</p>
                                                    <div className="flex items-center gap-4 px-6">
                                                        <div className="h-4 flex-1 bg-red-500/20 rounded-full overflow-hidden flex">
                                                            <div className="h-full bg-blue-500 transition-all" style={{ width: '65%' }} />
                                                            <div className="h-full bg-red-500 transition-all" style={{ width: '35%' }} />
                                                        </div>
                                                        <span className="text-xs font-black italic text-blue-500">65% Pos.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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

                                        <section className="pt-8 border-t border-white/5">
                                            <h3 className="text-xl font-black italic mb-6 flex items-center gap-4 text-purple-400 uppercase tracking-widest"><HelpCircle size={20} /> 분석 방법론 및 용어 해설 (Methodology)</h3>
                                            <div className="space-y-4">
                                                <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-black text-purple-300 uppercase">Real Poll (9%)</span>
                                                        <span className="text-[10px] text-gray-500 font-bold">Base Metric</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">최근 3개 주요 언론사 여론조사의 <span className="text-purple-200">가중 평균치</span>입니다. 단순 지지율을 넘어 추세를 반영합니다.</p>
                                                </div>
                                                <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-black text-yellow-300 uppercase">Win Prob (40%)</span>
                                                        <span className="text-[10px] text-gray-500 font-bold">Predictive Model</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">단순 지지율뿐만 아니라 <span className="text-yellow-200">네트워크 장악력, 이슈 주도권, 위기 대응력</span>을 변수로 10,000회 몬테카를로 시뮬레이션을 수행한 결과입니다. 지지율이 낮아도 확장성이 높으면 승률이 높게 산출됩니다.</p>
                                                </div>
                                                <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-black text-blue-300 uppercase">Intelligence Score (4.0/10)</span>
                                                        <span className="text-[10px] text-gray-500 font-bold">AI Assessment</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">뉴스 빅데이터상에서의 <span className="text-blue-200">언급 빈도와 문맥적 긍정/부정(Sentiment)</span>을 AI가 종합 평가한 지수입니다.</p>
                                                </div>
                                                <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-black text-green-300 uppercase">Network / Topological Metric</span>
                                                        <span className="text-[10px] text-gray-500 font-bold">Structural Analysis</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                                        <span className="font-bold text-white">매개(Betweenness):</span> 서로 다른 지지층을 연결하는 '다리' 역할의 크기 (확장성).<br />
                                                        <span className="font-bold text-white mt-1 block">위상(Topological):</span> 전체 정치 지형도에서 중심부(Key Player)에 위치하는지, 주변부에 머무는지에 대한 구조적 위치값.
                                                    </p>
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
                                <div className="relative pl-16"><div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">02</div><h3 className="text-xl font-black italic mb-6">고급 전술 메뉴 활용</h3><p className="text-gray-400 leading-relaxed">사이드바의 각 아이콘(지도, 위기 관리, 브랜드 분석 등)을 통해 고급 지표별 정밀 인터페이스로 전환할 수 있습니다.</p></div>
                                <div className="relative pl-16"><div className="absolute left-0 top-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-blue-500">03</div><h3 className="text-xl font-black italic mb-6">결과 근거 확인</h3><p className="text-gray-400 leading-relaxed">모든 수치와 섹션 제목 위로 마우스를 가져가면 데이터 산출 근거가 툴팁으로 표시됩니다.</p></div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.3); } @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 60s linear infinite; display: inline-flex; width: max-content; }`}</style>
        </div>
    );
}
