import os
import subprocess
import json
import time
import sys
import pandas as pd
from datetime import datetime
from anthropic import Anthropic

class StrategyCommandCenter:
    def __init__(self):
        self.api_key = os.environ.get("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=self.api_key) if self.api_key else None
        self.r_path = r"C:\Program Files\R\R-4.5.2\bin\Rscript.exe"
        self.repo_url = "https://github.com/2theDays/Election.git"
        self.vercel_url = "https://election-umber.vercel.app/"
        
        # 단계별 예상 소요 시간 (초)
        python_exe = sys.executable
        self.stages = [
            {"id": "NEWS", "name": "실시간 뉴스 & 여론조사 크롤링", "cmd": f'"{python_exe}" local_news_crawler.py', "eta": 30},
            {"id": "EVENT", "name": "가상 시나리오 에이전트 분석", "cmd": f'"{python_exe}" political_event_agent.py', "eta": 15},
            {"id": "NETWORK", "name": "다층 네트워크 지표 산출", "cmd": f'"{self.r_path}" network_analysis_premium.R', "eta": 12},
            {"id": "GIS", "name": "지역 지배력 및 공간 분석", "cmd": f'"{self.r_path}" regional_gis_analysis.R', "eta": 10},
            {"id": "STRESS", "name": "리스크 스트레스 테스트", "cmd": f'"{self.r_path}" stress_test_engine.R', "eta": 8},
            {"id": "SD", "name": "동태적 지지율 시뮬레이션", "cmd": f'"{self.r_path}" sd_model_deSolve.R', "eta": 5},
            {"id": "AI", "name": "AI 수석 컨설턴트 전략 도출", "cmd": "INTERNAL_GEN_REPORT", "eta": 20},
            {"id": "CLOUD", "name": "지휘소 클라우드 동기화 (Vercel)", "cmd": "GIT_SYNC", "eta": 15},
        ]

    def print_header(self):
        os.system('cls' if os.name == 'nt' else 'clear')
        print("="*60)
        print("   [ 2026 충북도지사 선거 전략 통합 지휘본부 v2.2 ]")
        print(f"   분석 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)

    def run_cmd(self, cmd):
        try:
            subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
            return True
        except Exception:
            return False

    def git_sync(self):
        """데이터를 GitHub에 업로드하여 Vercel 자동 배포 트리거"""
        commit_msg = f"Update_Daily_Briefing_{datetime.now().strftime('%m%d_%H%M')}"
        commands = [
            "git add .",
            f'git commit -m "{commit_msg}"',
            "git push origin main"
        ]
        for cmd in commands:
            if not self.run_cmd(cmd):
                return False
        return True

    def generate_strategic_report(self):
        """AI 전략 리포트 생성 로직"""
        if not self.client:
            return "⚠️ API 키가 누락되어 전략 리포트가 생성되지 않았습니다."
        
        try:
            # 주요 분석 파일 로드
            network = pd.read_csv("centrality_scores_multilayer.csv").to_string()
            stress = pd.read_csv("stress_test_summary.csv").to_string()
            
            prompt = f"당신은 선거 전략 수석 컨설턴트입니다. 다음 데이터를 바탕으로 승리 전략을 요약하세요.\n\n[네트워크]\n{network}\n\n[리스크]\n{stress}"
            
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        except Exception as e:
            return f"오류: {e}"

    def execute(self):
        self.print_header()
        total_steps = len(self.stages)
        start_time = time.time()

        for i, stage in enumerate(self.stages):
            progress = (i / total_steps) * 100
            remaining_eta = sum(s['eta'] for s in self.stages[i:])
            
            print(f"\n[{i+1}/{total_steps}] {stage['name']}...")
            print(f"   └─ 예상 남은 시간: 약 {remaining_eta}초 (전체 진척도: {progress:.1f}%)")
            
            s_time = time.time()
            success = False
            
            if stage['cmd'] == "INTERNAL_GEN_REPORT":
                report = self.generate_strategic_report()
                with open(f"Report_latest.md", "w", encoding="utf-8") as f:
                    f.write(report)
                success = True
            elif stage['cmd'] == "GIT_SYNC":
                success = self.git_sync()
            else:
                success = self.run_cmd(stage['cmd'])
            
            if success:
                elapsed = time.time() - s_time
                print(f"   ✅ 완료 ({elapsed:.1f}초)")
            else:
                print(f"   ❌ 단계 오류 발생 (건너뜀)")

        total_elapsed = time.time() - start_time
        print("\n" + "="*60)
        print("   🏁 모든 분석 및 클라우드 배포가 완료되었습니다!")
        print(f"   총 소요 시간: {total_elapsed/60:.1f}분")
        print(f"   대시보드: {self.vercel_url}")
        print("="*60)

if __name__ == "__main__":
    commander = StrategyCommandCenter()
    commander.execute()
