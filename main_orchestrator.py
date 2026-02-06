"""
2026 충북도지사 선거 전략 통합 지휘본부 (Strategy Command Center)
전체 파이프라인을 실행하고 최종 전략 리포트를 생성합니다.
"""

import os
import subprocess
import json
import pandas as pd
from datetime import datetime
from anthropic import Anthropic

class StrategyCommandCenter:
    def __init__(self):
        self.api_key = os.environ.get("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=self.api_key) if self.api_key else None
        self.r_path = r"C:\Program Files\R\R-4.5.2\bin\Rscript.exe" # 사용자 시스템 경로에 맞춤

    def run_stage(self, name, command):
        print(f"\n🚀 [{name}] 단계 실행 중...")
        try:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            print(f"✅ {name} 완료")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ {name} 실패: {e.stderr}")
            return False

    def generate_strategic_report(self):
        """모든 분석 데이터를 통합하여 Claude가 전략 제안 생성"""
        print("\n🧠 인공지능 전략 도출 중...")
        
        try:
            # 1. 데이터 로드
            network_scores = pd.read_csv("centrality_scores_multilayer.csv").to_string()
            regional_data = pd.read_csv("regional_dominance_data.csv").to_string()
            stress_test = pd.read_csv("stress_test_summary.csv").to_string()
            
            # 가상 이벤트 결과가 있다면 로드
            event_impact = ""
            if os.path.exists("event_impact_result.json"):
                with open("event_impact_result.json", "r", encoding="utf-8") as f:
                    event_impact = json.dumps(json.load(f), ensure_ascii=False, indent=2)

            prompt = f"""
당신은 '2026 충북도지사 선거 전략 지휘소'의 수석 컨설턴트입니다. 
다음은 실시간 수집된 데이터 분석 결과 및 리스크 테스트 보고서입니다. 
이를 바탕으로 승리를 위한 **초정밀 전략 리포트**를 작성하세요.

**[데이터 요약]**
1. 다층 네트워크 영향력:
{network_scores}

2. 지역별 지배력 현황:
{regional_data}

3. 스트레스 테스트 결과 (취약점 분석):
{stress_test}

4. 최근 발생한 핵심 이벤트 및 파급력:
{event_impact}

**[리포트 포함 사항]**
1. **현 판세 정밀 진단**: 누가 현재 실질적 주도권을 쥐고 있는가?
2. **후보별 리스크 관리**: 특정 자산(인맥/공당/여론) 상실 시 누가 가장 치명적인가?
3. **타겟 지역 전략**: 승부처(청주 등)를 장악하기 위한 구체적 행동 지침
4. **회복 탄력성 강화 전략**: 리스크 발생 시 타격을 최소화하기 위한 조직/프레임 구축법
5. **가상 시나리오 분석**: 현재의 가상 이벤트가 장기적으로 누구에게 유리한가?

**주의**: 반드시 실행 가능한 구체적인 수치와 지명을 언급하며 작성하세요.
"""
            if not self.client:
                return "⚠️ API 키가 없어 리포트를 생성할 수 없습니다."

            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return message.content[0].text
        except Exception as e:
            return f"❌ 리포트 생성 오류: {e}"

    def execute_full_pipeline(self):
        print(f"📅 분석 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 1. 데이터 요약
        self.run_stage("가상 이벤트 분석", "py political_event_agent.py")
        
        # 2. R 분석 엔진 실행
        self.run_stage("다층 네트워크 분석", f'"{self.r_path}" network_analysis_premium.R')
        self.run_stage("지역 GIS 분석", f'"{self.r_path}" regional_gis_analysis.R')
        self.run_stage("리스크 스트레스 테스트", f'"{self.r_path}" stress_test_engine.R')
        self.run_stage("SD 지지율 시뮬레이션", f'"{self.r_path}" sd_model_deSolve.R')
        
        # 3. 최종 전략 도출
        report = self.generate_strategic_report()
        
        report_file = f"Strategy_Report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(f"# 2026 충북도지사 선거 실시간 전략 리포트\n\n")
            f.write(f"**생성일시**: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
            f.write("---\n\n")
            f.write(report)
            
        print(f"\n🎯 전략 리포트가 생성되었습니다: {report_file}")

if __name__ == "__main__":
    commander = StrategyCommandCenter()
    commander.execute_full_pipeline()
