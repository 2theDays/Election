"""
Step 4: 정치 이벤트 파급력 분석 에이전트
Virtual Scenario Simulation Engine
"""

import json
import os
import re
from anthropic import Anthropic

# API 키 확인
api_key = os.environ.get("ANTHROPIC_API_KEY")

class PoliticalEventAgent:
    def __init__(self):
        try:
            with open('candidates_data.json', 'r', encoding='utf-8') as f:
                self.candidates = json.load(f)['candidates']
        except FileNotFoundError:
            self.candidates = []
            
    def simulate_event(self, event_description):
        """정치적 사건이 각 후보의 지계에 미치는 영향 분석 (가상 시뮬레이션)"""
        
        if not api_key:
            return self._get_mock_result(event_description)
            
        client = Anthropic(api_key=api_key)
        cand_names = [c['name'] for c in self.candidates]
        
        prompt = f"당신은 정치 전략 에이전트입니다. 사건: {event_description}. 대상: {', '.join(cand_names)}. " \
                 "각 후보의 official, private, sentiment, regional 지표 변화(-0.5~+0.5)를 JSON으로 분석하세요."
        
        try:
            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            response_text = message.content[0].text
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            return json.loads(json_match.group(0))
        except Exception as e:
            print(f"API 호출 실패로 가상 데이터를 생성합니다: {e}")
            return self._get_mock_result(event_description)

    def _get_mock_result(self, event_description):
        """API 부재 시 사용할 가상 시나리오 데이터"""
        return {
            "analysis": f"가상 시나리오 분석: {event_description}",
            "impact_matrix": {
                "신용한": {"official": 0.2, "private": 0.1, "sentiment": 0.4, "regional": 0.1, "reason": "이슈 주도권 확보"},
                "노영민": {"official": -0.1, "private": 0.0, "sentiment": -0.2, "regional": -0.1, "reason": "구체제 프레임 강화"},
                "송기섭": {"official": 0.0, "private": 0.0, "sentiment": 0.1, "regional": 0.2, "reason": "지역 기반 강화"},
                "한범덕": {"official": 0.0, "private": 0.0, "sentiment": 0.0, "regional": 0.0, "reason": "영향 미미"}
            }
        }

if __name__ == "__main__":
    agent = PoliticalEventAgent()
    # 가상 시나리오: '지역 균형발전 특별법 국회 통과 및 후보자들의 공적 다툼'
    virtual_event = "2026 충북 지역 균형발전 특별법이 국회를 통과하였으며, 신용한 후보가 이를 자신의 정책 로드맵의 승리라고 선언함"
    result = agent.simulate_event(virtual_event)
    
    with open('event_impact_result.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    
    print("\n" + "!" * 50)
    print("⚠️  주의: 본 결과는 알고리즘에 의한 가상 시뮬레이션입니다.")
    print("실제 정치 상황과는 무관하며, 모델링 테스트를 위한 데이터입니다.")
    print("!" * 50 + "\n")
    print(f"사건: {virtual_event}")
    print("분석 결과가 'event_impact_result.json'에 저장되었습니다.")
